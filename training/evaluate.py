from ultralytics import YOLO
import os

def evaluate_best_model():
    # Path to your best trained model
    model_path = os.path.join('backend', 'seed_model.pt')
    
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}. Train the model first.")
        return

    model = YOLO(model_path)

    # Validate the model
    # This generates metrics like mAP50, mAP50-95, Precision, and Recall
    print("Evaluating model performance on validation set...")
    metrics = model.val()
    
    print("\n--- PERFORMANCE SUMMARY ---")
    print(f"mAP 50: {metrics.box.map50:.4f}")
    print(f"mAP 50-95: {metrics.box.map:.4f}")
    print(f"Precision: {metrics.box.mp:.4f}")
    print(f"Recall: {metrics.box.mr:.4f}")
    print("---------------------------\n")
    
    # Save a confusion matrix (automatically saved to runs/detect/val)
    print("Confusion matrix and F1 curves have been saved to the validation run folder.")

if __name__ == "__main__":
    evaluate_best_model()
