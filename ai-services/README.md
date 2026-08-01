# Earthworm AI - EfficientNet-B0 Plant Disease Classifier

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![TensorFlow 2.15+](https://img.shields.io/badge/TensorFlow-2.15+-orange.svg)](https://tensorflow.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)

**Earthworm AI** is an AI-powered farming assistant image classification pipeline for detecting plant diseases from leaf photographs using transfer learning with **EfficientNet-B0**.

---

## 📁 Project Structure

```text
plant-disease-ai/
│
├── train.py          # Complete 2-stage training & fine-tuning script
├── predict.py        # Single image prediction CLI & inference class
├── app.py            # FastAPI REST inference service
├── model.py          # EfficientNet-B0 architecture builder & unfreezing helper
├── preprocessing.py  # Data augmentation & tf.data pipeline with caching/prefetching
├── evaluation.py     # Metrics (Accuracy, Precision, Recall, F1, Confusion Matrix) & plots
├── utils.py          # Logging setup, class names IO, label parser
├── requirements.txt  # Project Python dependencies
├── README.md         # Comprehensive documentation
└── models/           # Output directory for saved models (.keras and .h5) & metrics
```

---

## ⚡ Features

1. **EfficientNet-B0 Backbone**: Pretrained on ImageNet with a custom classification head (`GlobalAveragePooling2D` -> `Dropout(0.3)` -> `Dense(256, ReLU)` -> `Dropout(0.2)` -> `Dense(NUM_CLASSES, Softmax)`).
2. **Two-Stage Training**:
   - **Stage 1**: Train classification head with frozen backbone ($lr = 0.001$, 10 epochs).
   - **Stage 2**: Fine-tune top 20 layers of EfficientNet-B0 ($lr = 1\text{e-}5$, 5 epochs).
3. **Data Augmentation**: Random flip, rotation ($20\%$), zoom ($20\%$), and contrast ($20\%$) applied exclusively during training.
4. **Optimized Pipeline**: Uses `tf.data` with `.cache()` and `.prefetch(AUTOTUNE)` for maximum GPU/CPU throughput (batch size: `4`).
5. **Robust Callbacks**: Early Stopping, Learning Rate Reduction on Plateau, Model Checkpoint, and TensorBoard logging.
6. **Production Evaluation**: Calculates Accuracy, Precision, Recall, F1-score, Classification Report, and renders Confusion Matrix heatmaps.
7. **Dual Saved Formats**: Exports model as both `plant_disease_model.keras` and `plant_disease_model.h5`.
8. **FastAPI Inference Service**: Exposes `GET /health` and `POST /predict` endpoints.

---

## 🚀 Getting Started

### 1. Installation

Clone or enter the project directory and install dependencies:

```bash
cd plant-disease-ai
pip install -r requirements.txt
```

### 2. Dataset Setup

Prepare your dataset structured in class subdirectories as follows:

```text
dataset/
├── Tomato___Early_blight/
│   ├── image1.jpg
│   └── image2.jpg
├── Tomato___Late_blight/
│   ├── image3.jpg
│   └── image4.jpg
└── Tomato___healthy/
    ├── image5.jpg
    └── image6.jpg
```

---

## 🏋️ Training the Model

Execute `train.py` providing the path to your dataset directory:

```bash
python train.py --data_dir /path/to/dataset --epochs_stage1 10 --epochs_stage2 5
```

### Options:
* `--data_dir`: **(Required)** Path to dataset folder containing class subdirectories.
* `--epochs_stage1`: Initial training epochs (default: `10`).
* `--epochs_stage2`: Fine-tuning epochs (default: `5`).
* `--batch_size`: Batch size (default: `32`).
* `--lr_stage1`: Initial learning rate (default: `0.001`).
* `--lr_stage2`: Fine-tuning learning rate (default: `1e-5`).
* `--output_dir`: Path to save trained models and plots (default: `models`).
* `--logs_dir`: Directory for TensorBoard logs (default: `logs`).

---

## 🔍 Single Image Prediction (CLI)

To evaluate an image from the command line:

```bash
python predict.py --image_path /path/to/sample_leaf.jpg
```

**Sample Output:**
```text
==================================================
EARTHWORM AI - PREDICTION RESULTS
==================================================
Crop:            Tomato
Disease:         Early Blight
Confidence:      98.7%
Class Index:     2
Full Label:      Tomato___Early_blight
==================================================
```

---

## 🌐 FastAPI REST Service

### Start Service

Launch the REST server with Uvicorn:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs).

### API Endpoints

#### 1. Health Check
* **GET** `/health`
* **Response:**
  ```json
  {
    "status": "healthy"
  }
  ```

#### 2. Disease Prediction
* **POST** `/predict`
* **Body:** `multipart/form-data` containing image in field `file`
* **Response:**
  ```json
  {
    "crop": "Tomato",
    "disease": "Early Blight",
    "confidence": 98.7
  }
  ```

### Example cURL Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/leaf.jpg"
```

---

## 📊 TensorBoard Visualization

To view real-time training curves and metrics:

```bash
tensorboard --logdir=logs
```

Navigate to `http://localhost:6006` in your browser.
