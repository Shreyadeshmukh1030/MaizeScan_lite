import cv2
import numpy as np
from ultralytics import YOLO
import os

class SeedDetector:
    def __init__(self, model_path=None):
        if model_path and os.path.exists(model_path):
            self.model = YOLO(model_path)
            self.is_mock = False
        else:
            # Fallback to a pretrained yolov8n if no custom model provided
            # In a real scenario, we'd want the user to provide their path
            try:
                self.model = YOLO("yolov8n.pt")
                self.is_mock = False
            except:
                self.is_mock = True
        
        self.classes = ["Excellent", "Good", "Average", "Bad", "Worst"]

    def detect(self, image, conf=0.5):
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
        
        # Real inference (Forced CPU usage to prevent overheating)
        results = self.model(image, conf=conf, device='cpu')[0]
        detections = []
        for box in results.boxes:
            cls = int(box.cls[0])
            # Map index to our classes if possible, otherwise use original names
            label = results.names[cls]
            # For this project, we assume the model classes match our list
            # If not, we'd need a mapping
            if cls < len(self.classes):
                label = self.classes[cls]
            
            detections.append({
                "label": label,
                "confidence": float(box.conf[0]),
                "box": box.xyxy[0].tolist()
            })
        return detections
