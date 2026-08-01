"""
preprocessing.py - Data Augmentation, Preprocessing, and Dataset Loading Pipeline.

Uses tf.keras.utils.image_dataset_from_directory with performance optimizations
including caching and prefetching.
"""

import os
from typing import Tuple, List, Optional
import tensorflow as tf
from PIL import Image
import io
import numpy as np

from utils import get_logger

logger = get_logger("Preprocessing")

# Constants
IMAGE_SIZE: Tuple[int, int] = (224, 224)
BATCH_SIZE: int = 16


def get_data_augmentation() -> tf.keras.Sequential:
    """
    Builds data augmentation pipeline for training.

    Augmentations included:
    - Random Flip (horizontal & vertical)
    - Random Rotation (factor = 0.2)
    - Random Zoom (factor = 0.2)
    - Random Contrast (factor = 0.2)

    Returns:
        tf.keras.Sequential: Augmentation model layer sequence.
    """
    augmentation_model = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal_and_vertical", name="random_flip"),
            tf.keras.layers.RandomRotation(0.1, name="random_rotation"),
            tf.keras.layers.RandomZoom(0.1, name="random_zoom"),
            tf.keras.layers.RandomContrast(0.1, name="random_contrast"),
        ],
        name="data_augmentation",
    )
    return augmentation_model


def load_datasets(
    data_dir: str,
    img_size: Tuple[int, int] = IMAGE_SIZE,
    batch_size: int = BATCH_SIZE,
    val_split: float = 0.2,
    seed: int = 42,
) -> Tuple[tf.data.Dataset, tf.data.Dataset, List[str]]:
    """
    Loads dataset from directory using image_dataset_from_directory,
    applies augmentation on training set, and optimizes with caching and prefetching.

    Args:
        data_dir (str): Path to directory containing class subdirectories.
        img_size (Tuple[int, int]): Target image dimensions (height, width).
        batch_size (int): Batch size for dataset loading.
        val_split (float): Validation split ratio (default: 0.2).
        seed (int): Random seed for shuffle consistency.

    Returns:
        Tuple[tf.data.Dataset, tf.data.Dataset, List[str]]:
            - Cached and prefetched training dataset (with augmentation)
            - Cached and prefetched validation dataset
            - List of automatically detected class names
    """
    if not os.path.exists(data_dir):
        logger.error(f"Dataset directory not found: {data_dir}")
        raise FileNotFoundError(f"Dataset directory not found: {data_dir}")

    logger.info(f"Loading training dataset from '{data_dir}'...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=val_split,
        subset="training",
        seed=seed,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="int",
    )

    logger.info(f"Loading validation dataset from '{data_dir}'...")
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=val_split,
        subset="validation",
        seed=seed,
        image_size=img_size,
        batch_size=batch_size,
        label_mode="int",
    )

    # Detect class names automatically
    class_names: List[str] = train_ds.class_names
    logger.info(f"Detected {len(class_names)} classes: {class_names}")

    # Build data augmentation pipeline
    augmentation_layers = get_data_augmentation()

    # Apply data augmentation ONLY during training phase
    train_ds = train_ds.map(
        lambda x, y: (augmentation_layers(x, training=True), y),
        num_parallel_calls=2,
    )

    train_ds = train_ds.shuffle(1000)

    # Optimize datasets performance using file-backed caching and prefetching
    train_ds = train_ds.prefetch(buffer_size=2)
    val_ds = val_ds.prefetch(buffer_size=2)

    return train_ds, val_ds, class_names


def preprocess_single_image(
    image_input: str | bytes | Image.Image,
    target_size: Tuple[int, int] = IMAGE_SIZE,
) -> np.ndarray:
    """
    Preprocesses a single image for inference with EfficientNet-B0.

    Accepts file path (str), raw image bytes (bytes), or PIL Image object.
    Resizes image to target_size (224, 224) and expands dimensions to (1, 224, 224, 3).

    Args:
        image_input (Union[str, bytes, Image.Image]): Image input payload.
        target_size (Tuple[int, int]): Target image dimensions.

    Returns:
        np.ndarray: Preprocessed 4D batch tensor of shape (1, 224, 224, 3).
    """
    try:
        if isinstance(image_input, str):
            if not os.path.exists(image_input):
                raise FileNotFoundError(f"Image file does not exist: {image_input}")
            img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            img = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        # Resize image using high-quality bilinear interpolation
        img = img.resize(target_size, Image.Resampling.BILINEAR)
        img_array = np.array(img, dtype=np.float32)

        # Expand dimension to match model input batch shape: (1, height, width, 3)
        img_batch = np.expand_dims(img_array, axis=0)
        return img_batch

    except Exception as e:
        logger.error(f"Error preprocessing single image: {e}")
        raise
