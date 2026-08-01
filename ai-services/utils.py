"""
utils.py - General Utility Functions for Earthworm AI Plant Disease Classifier.

Provides logging setup, class label IO operations, and label parsing utilities.
"""

import json
import logging
import os
import sys
from typing import List, Tuple


def get_logger(name: str = "EarthwormAI", level: int = logging.INFO) -> logging.Logger:
    """
    Creates and configures a standardized logger.

    Args:
        name (str): Name of the logger instance.
        level (int): Logging level (default: logging.INFO).

    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(level)
        formatter = logging.Formatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
    return logger


logger = get_logger("Utils")


def save_class_names(class_names: List[str], output_path: str) -> None:
    """
    Saves the list of class names to a JSON file.

    Args:
        class_names (List[str]): List of target class names.
        output_path (str): File path where JSON will be saved.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=4)
    logger.info(f"Saved {len(class_names)} class names to {output_path}")


def load_class_names(input_path: str) -> List[str]:
    """
    Loads class names from a JSON file.

    Args:
        input_path (str): File path to class names JSON.

    Returns:
        List[str]: List of class names.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If JSON is invalid or not a list.
    """
    if not os.path.exists(input_path):
        logger.error(f"Class names file not found at: {input_path}")
        raise FileNotFoundError(f"Class names file not found at: {input_path}")

    with open(input_path, "r", encoding="utf-8") as f:
        class_names = json.load(f)

    if not isinstance(class_names, list):
        raise ValueError(f"Expected list of class names in {input_path}, got {type(class_names)}")

    logger.info(f"Successfully loaded {len(class_names)} class names from {input_path}")
    return class_names


def parse_crop_and_disease(class_name: str) -> Tuple[str, str]:
    """
    Parses a class name into crop type and disease name.

    Standard PlantVillage / Agricultural Dataset Naming Examples:
    - 'Tomato___Early_blight' -> Crop: 'Tomato', Disease: 'Early Blight'
    - 'Corn_(maize)___Common_rust_' -> Crop: 'Corn (maize)', Disease: 'Common rust'
    - 'Apple___healthy' -> Crop: 'Apple', Disease: 'Healthy'
    - 'Powdery_Mildew' -> Crop: 'Plant', Disease: 'Powdery Mildew'

    Args:
        class_name (str): Class label string.

    Returns:
        Tuple[str, str]: (Crop name, Disease name)
    """
    cleaned = class_name.strip()
    
    # Common delimiter in Kaggle PlantVillage datasets is '___'
    if "___" in cleaned:
        parts = cleaned.split("___", 1)
        crop = parts[0].replace("_", " ").strip()
        disease = parts[1].replace("_", " ").strip()
    elif "__" in cleaned:
        parts = cleaned.split("__", 1)
        crop = parts[0].replace("_", " ").strip()
        disease = parts[1].replace("_", " ").strip()
    elif " - " in cleaned:
        parts = cleaned.split(" - ", 1)
        crop = parts[0].strip()
        disease = parts[1].strip()
    else:
        # Fallback if no crop prefix is present
        crop = "Plant"
        disease = cleaned.replace("_", " ").strip()

    # Format names nicely
    crop = crop.title() if not crop.isupper() else crop
    disease = disease.replace("  ", " ").title()

    return crop, disease
