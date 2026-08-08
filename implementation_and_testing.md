# MaizeScan: Comprehensive Implementation & Testing Guide

This document provides a deep dive into the technical implementation and testing methodologies for the MaizeScan project. It includes specific code examples for data preprocessing, model inference, and system testing, as requested for your project evaluation.

---

## 1. Data Preprocessing & Verification

Before training or running inference, the dataset must be loaded, verified, and preprocessed. This involves checking file integrity, analyzing pixel data (to understand lighting/color distribution), and encoding categorical labels.

### 1.1 Defining Paths and Verifying Dataset Files
This script ensures that all training images and corresponding annotation files are present in the dataset directory before processing.

```python
import os
import glob

def verify_dataset_integrity(dataset_path: str) -> dict:
    """
    Verifies the number of image files and their corresponding label files.
    """
    print(f"Loading dataset from: {dataset_path}")
    
    # Define paths
    images_path = os.path.join(dataset_path, "images", "train")
    labels_path = os.path.join(dataset_path, "labels", "train")
    
    # Count files
    image_files = glob.glob(os.path.join(images_path, "*.jpg"))
    label_files = glob.glob(os.path.join(labels_path, "*.txt"))
    
    print(f"Found {len(image_files)} images and {len(label_files)} label files.")
    
    # Verify exact match
    if len(image_files) != len(label_files):
        print("WARNING: Mismatch between images and labels!")
        
    return {
        "images_count": len(image_files),
        "labels_count": len(label_files),
        "status": "Verified" if len(image_files) == len(label_files) else "Corrupted"
    }

# Example Usage
# stats = verify_dataset_integrity("/dataset/maize_v1")
```

### 1.2 Image Analysis: Pixel Color Counting
To handle the "Lighting & Shadow" limitations discussed earlier, we can analyze specific images to count color pixels. This helps us determine if an image is too dark or too yellow before passing it to the AI.

```python
import cv2
import numpy as np

def analyze_pixel_colors(image_path: str):
    """
    Loads a specific image and counts the distribution of 'Yellow' (healthy) 
    vs 'Dark' (defective/shadow) pixels using HSV color space.
    """
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not found at specified path.")
        
    # Convert BGR to HSV for better color masking
    hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Define color range for Healthy Maize (Yellow/Orange)
    lower_yellow = np.array([20, 100, 100])
    upper_yellow = np.array([30, 255, 255])
    
    # Define color range for Dark/Moldy pixels
    lower_dark = np.array([0, 0, 0])
    upper_dark = np.array([180, 255, 50])
    
    # Create masks
    yellow_mask = cv2.inRange(hsv_img, lower_yellow, upper_yellow)
    dark_mask = cv2.inRange(hsv_img, lower_dark, upper_dark)
    
    # Count pixels
    yellow_pixels = cv2.countNonZero(yellow_mask)
    dark_pixels = cv2.countNonZero(dark_mask)
    total_pixels = img.shape[0] * img.shape[1]
    
    print(f"Total Pixels: {total_pixels}")
    print(f"Healthy (Yellow) Pixels: {yellow_pixels} ({(yellow_pixels/total_pixels)*100:.2f}%)")
    print(f"Defective (Dark) Pixels: {dark_pixels} ({(dark_pixels/total_pixels)*100:.2f}%)")

# Example Usage
# analyze_pixel_colors("sample_maize.jpg")
```

### 1.3 One-Hot Encoding for Classifications
While YOLO natively handles class mapping internally, when we extract the data for our Analytics Dashboard or train custom Classifiers, we use One-Hot Encoding to categorize the seeds numerically.

```python
import numpy as np

def one_hot_encode_grades(grade_labels: list) -> np.ndarray:
    """
    Converts categorical text labels into a One-Hot Encoded matrix.
    Classes: 0: Excellent, 1: Good, 2: Average, 3: Bad, 4: Worst
    """
    class_mapping = {"Excellent": 0, "Good": 1, "Average": 2, "Bad": 3, "Worst": 4}
    num_classes = len(class_mapping)
    
    # Initialize zero matrix: (number_of_labels) x (number_of_classes)
    encoded_matrix = np.zeros((len(grade_labels), num_classes), dtype=int)
    
    for i, label in enumerate(grade_labels):
        if label in class_mapping:
            class_index = class_mapping[label]
            encoded_matrix[i, class_index] = 1
            
    return encoded_matrix

# Example Usage
# labels = ["Excellent", "Bad", "Good", "Worst"]
# encoded = one_hot_encode_grades(labels)
# print(encoded)
# Output: [[1 0 0 0 0], [0 0 0 1 0], [0 1 0 0 0], [0 0 0 0 1]]
```

---

## 2. Core Model Implementation

### 2.1 The YOLOv8 Inference Engine
This is the heart of the system. It takes the preprocessed image and runs it through the neural network to find bounding boxes.

```python
from ultralytics import YOLO
import cv2

class SeedDetector:
    def __init__(self, model_path="seed_model.pt"):
        # Load the fine-tuned YOLOv8 model
        self.model = YOLO(model_path)
        self.class_names = ["Excellent", "Good", "Average", "Bad", "Worst"]

    def detect(self, image_array, confidence_threshold=0.5):
        """
        Runs inference on a numpy image array.
        """
        # Perform inference
        results = self.model.predict(
            source=image_array, 
            conf=confidence_threshold,
            iou=0.45 # Non-Maximum Suppression threshold to prevent overlapping boxes
        )
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Extract coordinates (x, y, width, height)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Extract class and confidence
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "class": self.class_names[cls_id],
                    "confidence": conf
                })
                
        return detections
```

---

## 3. Testing Strategy

To ensure MaizeScan is production-ready, we implement rigorous testing across multiple levels.

### 3.1 Unit Testing (Backend & Logic)
Unit tests isolate specific functions to ensure they work perfectly under different conditions. We use Python's `pytest` framework.

```python
# test_logic.py
import pytest
from backend.main import calculate_revenue

def test_revenue_calculation_premium():
    # Arrange
    weight_kg = 1000  # 10 Quintals
    grade = "A"
    
    # Act
    revenue = calculate_revenue(weight_kg, grade)
    
    # Assert
    assert revenue == 28000, f"Expected 28000, got {revenue}"

def test_revenue_calculation_industrial():
    # Arrange
    weight_kg = 500  # 5 Quintals
    grade = "C"
    
    # Act
    revenue = calculate_revenue(weight_kg, grade)
    
    # Assert
    assert revenue == 6250, f"Expected 6250, got {revenue}"
    
def test_one_hot_encoding():
    labels = ["Excellent"]
    encoded = one_hot_encode_grades(labels)
    assert encoded[0][0] == 1
    assert encoded[0][4] == 0
```

### 3.2 Integration Testing (API & Database)
Integration tests verify that different modules (like the API router and the Database) communicate correctly.

```python
# test_api.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_save_batch_endpoint():
    """
    Tests if the backend successfully receives JSON and saves to the DB.
    """
    payload = {
        "total_count": 100,
        "excellent_count": 90,
        "bad_count": 10,
        "latitude": 21.1458,
        "longitude": 79.0882
    }
    
    # Send mock POST request
    response = client.post("/batches/", json=payload)
    
    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Batch saved successfully"
    assert "batch_id" in data
```

### 3.3 UI & End-to-End Testing (Frontend)
For the frontend, we use tools like **Jest** and **React Testing Library** to ensure the interface renders the AI data correctly.

```javascript
// DetectionPage.test.jsx
import { render, screen } from '@testing-library/react';
import DetectionPage from './DetectionPage';

test('renders the live telemetry counters correctly', () => {
  // Render the component
  render(<DetectionPage />);
  
  // Find the 'Total Detected' element
  const totalCountElement = screen.getByText(/Total Detected/i);
  expect(totalCountElement).toBeInTheDocument();
  
  // Ensure the AI Sensitivity slider exists
  const slider = screen.getByRole('slider');
  expect(slider).toBeInTheDocument();
});
```

### 3.4 Performance & Load Testing
*   **FPS Testing**: We track the delta time between frame captures in the React frontend. Our target is **>15 FPS**.
*   **Latency Testing**: We measure the "Round Trip Time" (RTT). The time from when the React app sends the Blob to when the FastAPI returns the JSON boxes must be **<200ms**.
