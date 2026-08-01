"""
app.py - FastAPI REST Inference Server for Earthworm AI Plant Disease Classification.

Endpoints:
- GET  /health   -> Returns {"status": "healthy"}
- POST /predict  -> Accepts leaf image file, returns crop name, disease name, and confidence score.
"""

from contextlib import asynccontextmanager
import os
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predict import DiseasePredictor
from utils import get_logger

logger = get_logger("FastAPIApp")

# Global predictor instance
predictor: DiseasePredictor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Initializes model resource once on startup.
    """
    global predictor
    logger.info("Initializing Earthworm AI DiseasePredictor on startup...")
    model_path = os.getenv("MODEL_PATH", "models/plant_disease_model.keras")
    class_names_path = os.getenv("CLASS_NAMES_PATH", "models/class_names.json")

    try:
        predictor = DiseasePredictor(model_path=model_path, class_names_path=class_names_path)
        logger.info("Predictor initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize model on startup ({e}). Predictor will lazy-load or fail gracefully on endpoint call.")
        predictor = None

    yield
    logger.info("Shutting down FastAPI service...")


app = FastAPI(
    title="Earthworm AI - Plant Disease Classifier API",
    description="Production REST service for image-based crop disease diagnosis using EfficientNet-B0.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for web and mobile frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str


class PredictionResponse(BaseModel):
    crop: str
    disease: str
    confidence: float


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify service operational status."""
    return {"status": "healthy"}


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_plant_disease(file: UploadFile = File(...)):
    """
    Accepts an uploaded leaf image and returns predicted crop, disease name, and confidence score.
    """
    global predictor

    # Validate image file upload
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image (e.g. image/jpeg, image/png).",
        )

    try:
        # Lazy initialization if not loaded during startup
        if predictor is None:
            model_path = os.getenv("MODEL_PATH", "models/plant_disease_model.keras")
            class_names_path = os.getenv("CLASS_NAMES_PATH", "models/class_names.json")
            predictor = DiseasePredictor(model_path=model_path, class_names_path=class_names_path)

        # Read image bytes
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file received.",
            )

        # Execute prediction pipeline
        result = predictor.predict(image_bytes)

        return {
            "crop": result["crop"],
            "disease": result["disease"],
            "confidence": result["confidence"],
        }

    except FileNotFoundError as fnf_err:
        logger.error(f"Model file error: {fnf_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model weights file not found on server. Please train the model first.",
        )
    except Exception as err:
        logger.error(f"Prediction failed: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(err)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
