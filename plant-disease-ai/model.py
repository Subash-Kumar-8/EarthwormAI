"""
model.py - EfficientNet-B0 Model Architecture and Transfer Learning Logic.

Defines model builder for initial transfer learning stage and layer unfreezing for fine-tuning.
"""

from typing import Tuple
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input

from utils import get_logger

logger = get_logger("Model")


def build_model(
    num_classes: int,
    input_shape: Tuple[int, int, int] = (224, 224, 3),
) -> Tuple[tf.keras.Model, tf.keras.Model]:
    """
    Builds Plant Disease Classifier using EfficientNet-B0 backbone.

    Args:
        num_classes (int): Number of target classification categories.
        input_shape (Tuple[int, int, int]): Input image tensor shape (height, width, channels).

    Returns:
        Tuple[tf.keras.Model, tf.keras.Model]:
            - Complete Keras model with classification head.
            - Pretrained EfficientNet-B0 base model backbone.
    """
    logger.info(f"Building EfficientNet-B0 model for {num_classes} classes...")

    # Load EfficientNet-B0 backbone pretrained on ImageNet
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=input_shape,
    )

    # Freeze the base model backbone initially
    base_model.trainable = False

    # Construct classification head
    inputs = tf.keras.Input(shape=input_shape, name="input_layer")
    
    # Pass inputs through base model backbone (set training=False to keep BatchNorm in inference mode)
    x = preprocess_input(inputs)
    
    x = base_model(x, training=False)    
    x = tf.keras.layers.GlobalAveragePooling2D(name="global_avg_pooling")(x)
    x = tf.keras.layers.Dropout(0.3, name="dropout_1")(x)
    x = tf.keras.layers.Dense(256, activation="relu", name="dense_256")(x)
    x = tf.keras.layers.Dropout(0.2, name="dropout_2")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="output_layer")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="PlantDisease_EfficientNetB0")

    logger.info("Model architecture successfully constructed.")
    return model, base_model


def unfreeze_for_finetuning(
    model: tf.keras.Model,
    base_model: tf.keras.Model,
    num_unfreeze_layers: int = 20,
) -> tf.keras.Model:
    """
    Unfreezes the specified number of top layers of EfficientNet-B0 for fine-tuning.

    Args:
        model (tf.keras.Model): Full classification model.
        base_model (tf.keras.Model): EfficientNet-B0 base model backbone.
        num_unfreeze_layers (int): Number of layers at the top of base_model to unfreeze (default: 20).

    Returns:
        tf.keras.Model: Model with updated layer trainable flags.
    """
    logger.info(f"Unfreezing last {num_unfreeze_layers} layers of EfficientNet-B0 backbone for fine-tuning...")

    # Unfreeze the base model
    base_model.trainable = True

    # Total number of layers in backbone
    total_layers = len(base_model.layers)
    freeze_until = total_layers - num_unfreeze_layers

    # Freeze earlier layers, unfreeze the top N layers
    for i, layer in enumerate(base_model.layers):
        if i < freeze_until:
            layer.trainable = False
        else:
            # Keep BatchNormalization layers frozen during fine-tuning for stability
            if isinstance(layer, tf.keras.layers.BatchNormalization):
                layer.trainable = False
            else:
                layer.trainable = True

    trainable_count = sum([1 for l in base_model.layers if l.trainable])
    logger.info(
        f"Base model layer count: {total_layers}. "
        f"Layers 0..{freeze_until-1} frozen. "
        f"Trainable layers in backbone: {trainable_count}."
    )

    return model
