import cv2
import numpy as np
import shutil
from pathlib import Path
import random

def auto_label_seeds():
    base_path = Path(r"c:\Users\HP\OneDrive\Desktop\Maize Scan\dataset\training_set")
    output_path = Path(r"c:\Users\HP\OneDrive\Desktop\Maize Scan\yolo_dataset")
    debug_path = Path(r"c:\Users\HP\OneDrive\Desktop\Maize Scan\label_debug")
    
    classes = ['Excellent', 'Good', 'Average', 'Bad', 'Worst']
    
    if output_path.exists(): shutil.rmtree(output_path)
    if debug_path.exists(): shutil.rmtree(debug_path)
    
    for split in ['train', 'val']:
        (output_path / split / 'images').mkdir(parents=True, exist_ok=True)
        (output_path / split / 'labels').mkdir(parents=True, exist_ok=True)
    debug_path.mkdir(exist_ok=True)

    print("Starting FAST & ROBUST auto-labeling...")

    for cls_idx, cls_name in enumerate(classes):
        folder = base_path / cls_name
        if not folder.exists(): continue
            
        images = list(folder.glob("*.JPG")) + list(folder.glob("*.jpg"))
        print(f"\n>>> Class: {cls_name} ({len(images)} images)")
        
        random.shuffle(images)
        split_idx = int(len(images) * 0.8)
        
        success_count = 0
        for i, img_path in enumerate(images):
            split = 'train' if i < split_idx else 'val'
            img = cv2.imread(str(img_path))
            if img is None: continue
            
            # Use smaller size for faster processing and training
            img = cv2.resize(img, (640, 640))
            h, w = img.shape[:2]
            
            # Simple but effective segmentation
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Use Otsu's after Gaussian blur for best general segment
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # We try light-on-dark first, then check if we got enough seeds
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # If everything is white, the Otsu likely picked the background. Invert.
            if np.mean(thresh) > 127:
                thresh = cv2.bitwise_not(thresh)
            
            kernel = np.ones((3,3), np.uint8)
            morph = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
            
            cnts, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            yolo_labels = []
            
            for cnt in cnts:
                area = cv2.contourArea(cnt)
                x, y, cw, ch = cv2.boundingRect(cnt)
                
                # Filter by area (assuming seeds are significant blobs in 640x640)
                if 200 < area < 10000 and 15 < cw < 150 and 15 < ch < 150:
                    x_center, y_center = (x + cw/2) / w, (y + ch/2) / h
                    nw, nh = cw / w, ch / h
                    yolo_labels.append(f"{cls_idx} {x_center:.6f} {y_center:.6f} {nw:.6f} {nh:.6f}")

            if yolo_labels:
                new_name = f"{cls_name}_{i}.jpg"
                cv2.imwrite(str(output_path / split / 'images' / new_name), img)
                with open(output_path / split / 'labels' / f"{cls_name}_{i}.txt", "w") as f:
                    f.write("\n".join(yolo_labels))
                
                if success_count < 2: # Save a few debug images per class
                    for (label) in yolo_labels:
                        l, xc, yc, nw, nh = map(float, label.split())
                        bx, by = int((xc - nw/2) * w), int((yc - nh/2) * h)
                        bw, bh = int(nw * w), int(nh * h)
                        cv2.rectangle(img, (bx, by), (bx+bw, by+bh), (0, 255, 0), 2)
                    cv2.imwrite(str(debug_path / f"{cls_name}_{i}_check.jpg"), img)
                
                success_count += 1
                if success_count % 50 == 0:
                    print(f"  - Captured {success_count} images for {cls_name}...", end='\r')

        print(f"  - Final: {success_count} images successfully labeled for {cls_name}")

    with open(output_path / 'data.yaml', "w") as f:
        f.write(f"train: {output_path}/train/images\nval: {output_path}/val/images\nnc: 5\nnames: {classes}")

    print(f"\n[DONE] Dataset created at: {output_path}")

if __name__ == "__main__":
    auto_label_seeds()
