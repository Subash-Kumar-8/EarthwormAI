"""
predict.py - Standalone Prediction Script and Disease Predictor Class for Earthworm AI.

Loads saved model once, preprocesses image, runs inference, and returns prediction results.
"""

import argparse
import os
import sys
from typing import Dict, Any, List, Optional
import numpy as np
import tensorflow as tf
from PIL import Image

from preprocessing import preprocess_single_image, IMAGE_SIZE
from utils import get_logger, load_class_names, parse_crop_and_disease

logger = get_logger("Predictor")


class DiseasePredictor:
    """
    Inference class for Earthworm AI plant disease model.
    Loads trained Keras model once into memory and provides fast prediction methods.
    Supports auto-downloading model artifacts from Hugging Face Hub.
    """

    def __init__(
        self,
        model_path: str = "models/plant_disease_model.keras",
        class_names_path: str = "models/class_names.json",
        hf_repo_id: Optional[str] = None,
        hf_token: Optional[str] = None,
    ):
        """
        Initializes DiseasePredictor by loading model and class labels.

        Args:
            model_path (str): Path to saved model (.keras or .h5 file).
            class_names_path (str): Path to class names JSON file.
            hf_repo_id (Optional[str]): Hugging Face repo ID to download model from if missing locally.
            hf_token (Optional[str]): Optional Hugging Face auth token.
        """
        self.model_path = model_path
        self.class_names_path = class_names_path
        self.hf_repo_id = hf_repo_id or os.getenv("HF_REPO_ID")
        self.hf_token = hf_token or os.getenv("HF_TOKEN")
        self.model: Optional[tf.keras.Model] = None
        self.class_names: List[str] = []

        self._load_resources()

    def _download_from_hf(self) -> None:
        """Downloads model and class names from Hugging Face Hub if missing locally."""
        if not self.hf_repo_id:
            return

        # Clean repo_id if a full URL was passed
        if "huggingface.co/" in self.hf_repo_id:
            self.hf_repo_id = self.hf_repo_id.split("huggingface.co/")[-1].strip("/")

        logger.info(f"Attempting to download model from Hugging Face repository '{self.hf_repo_id}'...")
        try:
            from huggingface_hub import hf_hub_download

            model_filename = os.path.basename(self.model_path)
            if not model_filename.endswith((".keras", ".h5")):
                model_filename = "plant_disease_model.keras"

            downloaded_model_path = hf_hub_download(
                repo_id=self.hf_repo_id,
                filename=model_filename,
                token=self.hf_token,
            )
            self.model_path = downloaded_model_path
            logger.info(f"Successfully downloaded model file from HF Hub to '{downloaded_model_path}'.")

            class_names_filename = os.path.basename(self.class_names_path)
            try:
                downloaded_class_path = hf_hub_download(
                    repo_id=self.hf_repo_id,
                    filename=class_names_filename,
                    token=self.hf_token,
                )
                self.class_names_path = downloaded_class_path
                logger.info(f"Successfully downloaded class names from HF Hub to '{downloaded_class_path}'.")
            except Exception as e:
                logger.warning(f"Could not download class names from HF Hub: {e}")

        except Exception as e:
            logger.error(f"Failed to download model from Hugging Face Hub '{self.hf_repo_id}': {e}")

    def _load_resources(self) -> None:
        """Loads saved Keras model and class names json into memory."""
        # Check if local model exists, else try downloading from HF
        if not os.path.exists(self.model_path):
            alt_path = self.model_path.replace(".keras", ".h5") if self.model_path.endswith(".keras") else self.model_path.replace(".h5", ".keras")
            if os.path.exists(alt_path):
                logger.info(f"Model not found at {self.model_path}, using alternative path: {alt_path}")
                self.model_path = alt_path
            elif self.hf_repo_id:
                self._download_from_hf()
            else:
                logger.error(f"Model file not found at: {self.model_path} or {alt_path}")
                raise FileNotFoundError(f"Model file not found at: {self.model_path}. Set HF_REPO_ID to auto-download from Hugging Face.")

        logger.info(f"Loading trained TensorFlow model from '{self.model_path}'...")
        try:
            self.model = tf.keras.models.load_model(self.model_path, compile=False)
            logger.info("Model successfully loaded into memory.")
        except Exception as e:
            logger.error(f"Failed to load model from {self.model_path}: {e}")
            raise

        # Load class names
        if os.path.exists(self.class_names_path):
            self.class_names = load_class_names(self.class_names_path)
        else:
            logger.warning(f"Class names file not found at {self.class_names_path}. Defaulting to dummy class labels.")
            num_outputs = self.model.output_shape[-1]
            self.class_names = [f"Class_{i}" for i in range(num_outputs)]

    def predict(self, image_input: str | bytes | Image.Image) -> Dict[str, Any]:
        """
        Predicts plant disease from image input.

        Args:
            image_input (Union[str, bytes, Image.Image]): Image path, byte stream, or PIL object.

        Returns:
            Dict[str, Any]: Dictionary containing:
                - crop (str): Parsed crop species name
                - disease (str): Parsed disease name
                - confidence (float): Confidence score percentage (0-100)
                - class_index (int): Predicted numeric index
                - class_name (str): Original full class string label
        """
        if self.model is None:
            raise RuntimeError("Predictor model is not initialized.")

        # Preprocess input image to (1, 224, 224, 3) tensor
        input_tensor = preprocess_single_image(image_input, target_size=IMAGE_SIZE)

        # Run inference
        predictions = self.model.predict(input_tensor, verbose=0)
        probabilities = predictions[0]

        predicted_index = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_index] * 100.0)
        full_class_name = self.class_names[predicted_index] if predicted_index < len(self.class_names) else f"Class_{predicted_index}"

        crop_name, disease_name = parse_crop_and_disease(full_class_name)

        result = {
            "crop": crop_name,
            "disease": disease_name,
            "confidence": round(confidence, 2),
            "class_index": predicted_index,
            "class_name": full_class_name,
        }

        logger.info(f"Prediction result: {crop_name} - {disease_name} ({result['confidence']}%)")
        return result


def main():
    parser = argparse.ArgumentParser(description="Earthworm AI Plant Disease Single Image Predictor")
    parser.add_argument("--image_path", type=str, required=True, help="Path to leaf image file for prediction")
    parser.add_argument("--model_path", type=str, default="models/plant_disease_model.keras", help="Path to saved .keras or .h5 model")
    parser.add_argument("--class_names_path", type=str, default="models/class_names.json", help="Path to class_names.json")

    args = parser.parse_args()

    predictor = DiseasePredictor(model_path=args.model_path, class_names_path=args.class_names_path)
    result = predictor.predict(args.image_path)

    print("\n" + "=" * 50)
    print("EARTHWORM AI - PREDICTION RESULTS")
    print("=" * 50)
    print(f"Crop:            {result['crop']}")
    print(f"Disease:         {result['disease']}")
    print(f"Confidence:      {result['confidence']}%")
    print(f"Class Index:     {result['class_index']}")
    print(f"Full Label:      {result['class_name']}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
