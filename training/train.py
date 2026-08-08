import os
from ultralytics import YOLO
import torch
from pathlib import Path

def train_model():
    # Path to the last checkpoint to allow resuming
    resume_checkpoint = Path(r"c:\Users\HP\OneDrive\Desktop\Maize Scan\runs\detect\maizescan_generalized\weights\last.pt")
    
    # Check if we should resume
    if resume_checkpoint.exists():
        print(f">>> FOUND CHECKPOINT: Resuming from {resume_checkpoint}")
        model = YOLO(resume_checkpoint)
        resume_flag = True
    else:
        print(">>> NEW TRAINING: Starting fresh with yolov8n.pt")
        model = YOLO('yolov8n.pt')
        resume_flag = False

    data_path = r"c:\Users\HP\OneDrive\Desktop\Maize Scan\yolo_dataset\data.yaml"

    if not os.path.exists(data_path):
        print(f"Error: Could not find data.yaml at {data_path}")
        return

    # Check for GPU availability
    device = 0 if torch.cuda.is_available() else 'cpu'
    if device == 0:
        print(f">>> SUCCESS: GPU Active! Utilizing NVIDIA hardware.")

    print(f"Starting/Resuming High-Accuracy Training (Optimized for 4GB VRAM)...")
    
    # Training parameters - REDUCED BATCH SIZE TO FIX OUT OF MEMORY
    results = model.train(
        data=data_path,
        epochs=30,             
        imgsz=1024,            
        batch=4,            # REDUCED from 16 to 4 to fit in RTX 3050 Laptop Memory
        patience=10,            
        optimizer='AdamW',      
        lr0=0.01,               
        cos_lr=True,            
        close_mosaic=10,        
        save=True,              
        device=device,
        name='maizescan_generalized',
        resume=resume_flag, 
        exist_ok=True,      
        hsv_h=0.015,  
        hsv_s=0.7,    
        hsv_v=0.4,    
        degrees=15.0, 
        translate=0.1, 
        scale=0.5,    
        shear=0.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1
    )

    print("Training complete. Best model saved in runs/detect/maizescan_generalized/weights/best.pt")

if __name__ == "__main__":
    train_model()
