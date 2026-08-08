import cv2
import numpy as np
import onnxruntime as ort
import os

class SeedDetector:
    def __init__(self, model_path=None):
        self.is_mock = False
        if model_path and os.path.exists(model_path):
            self.session = ort.InferenceSession(model_path)
        else:
            self.is_mock = True
        
        self.classes = ["Excellent", "Good", "Average", "Bad", "Worst"]

    def detect(self, image, conf=0.45):
        if self.is_mock:
            # Random mock detections for testing UI
            num_seeds = np.random.randint(1, 10)
            results = []
            for _ in range(num_seeds):
                cls_idx = np.random.randint(0, 5)
                confidence = float(np.random.uniform(0.7, 0.99))
                if confidence < conf: continue
                results.append({
                    "label": self.classes[cls_idx],
                    "confidence": confidence,
                    "box": [
                        float(np.random.randint(0, 100)),
                        float(np.random.randint(0, 100)),
                        float(np.random.randint(200, 300)),
                        float(np.random.randint(200, 300))
                    ]
                })
            return results
        
        original_h, original_w = image.shape[:2]
        
        # Resize the image to 640x640, convert BGR to RGB, normalize to [0,1], and transpose
        resized = cv2.resize(image, (640, 640))
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        normalized = rgb.astype(np.float32) / 255.0
        transposed = np.transpose(normalized, (2, 0, 1))
        input_tensor = np.expand_dims(transposed, axis=0)
        
        # Run the ONNX session
        input_name = self.session.get_inputs()[0].name
        outputs = self.session.run(None, {input_name: input_tensor})
        output = outputs[0]  # shape: (1, 9, 8400)
        
        # Transpose it to (8400, 9)
        output = np.transpose(output[0])
        
        boxes = []
        scores = []
        class_ids = []
        
        x_scale = original_w / 640.0
        y_scale = original_h / 640.0
        
        for row in output:
            class_scores = row[4:]
            class_id = np.argmax(class_scores)
            max_score = class_scores[class_id]
            
            if max_score >= conf:
                # box is [cx, cy, w, h] in 640x640 space
                cx, cy, w, h = row[0], row[1], row[2], row[3]
                
                # scale back to original image size
                cx_scaled = cx * x_scale
                cy_scaled = cy * y_scale
                w_scaled = w * x_scale
                h_scaled = h * y_scale
                
                # convert to [x_min, y_min, w, h] for NMSBoxes
                x_min = cx_scaled - w_scaled / 2
                y_min = cy_scaled - h_scaled / 2
                
                boxes.append([x_min, y_min, w_scaled, h_scaled])
                scores.append(float(max_score))
                class_ids.append(class_id)
                
        # Apply Non-Maximum Suppression
        indices = cv2.dnn.NMSBoxes(boxes, scores, conf, 0.45)
        
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                x_min, y_min, w, h = boxes[i]
                
                # frontend expects box as [x_min, y_min, x_max, y_max]
                x_max = x_min + w
                y_max = y_min + h
                
                cls_id = class_ids[i]
                label = self.classes[cls_id] if cls_id < len(self.classes) else str(cls_id)
                
                detections.append({
                    "label": label,
                    "confidence": scores[i],
                    "box": [float(x_min), float(y_min), float(x_max), float(y_max)]
                })
                
        return detections
