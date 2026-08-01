"""
train.py - Complete Training and Fine-Tuning Pipeline for Plant Disease Classification.

Executes 2-stage transfer learning using EfficientNet-B0:
- Stage 1: Train classification head with frozen backbone (10 epochs, lr = 0.001)
- Stage 2: Fine-tune top 20 layers of EfficientNet-B0 (5 epochs, lr = 1e-5)
- Evaluates metrics and exports models as plant_disease_model.keras & plant_disease_model.h5
"""

import argparse
import os
import sys
from datetime import datetime
import tensorflow as tf

from preprocessing import load_datasets, IMAGE_SIZE, BATCH_SIZE
from model import build_model, unfreeze_for_finetuning
from evaluation import evaluate_model, plot_training_history
from utils import get_logger, save_class_names
from tensorflow.keras import mixed_precision

mixed_precision.set_global_policy("mixed_float16")

logger = get_logger("TrainPipeline")


def run_training(
    data_dir: str,
    epochs_stage1: int = 10,
    epochs_stage2: int = 5,
    batch_size: int = BATCH_SIZE,
    lr_stage1: float = 0.001,
    lr_stage2: float = 1e-5,
    output_dir: str = "models",
    logs_dir: str = "logs",
) -> None:
    """
    Main training execution function.

    Args:
        data_dir (str): Path to dataset directory containing class subdirectories.
        epochs_stage1 (int): Epochs for stage 1 initial head training (default: 10).
        epochs_stage2 (int): Epochs for stage 2 fine-tuning (default: 5).
        batch_size (int): Batch size (default: 32).
        lr_stage1 (float): Initial learning rate (default: 0.001).
        lr_stage2 (float): Fine-tuning learning rate (default: 1e-5).
        output_dir (str): Folder to save trained models and metrics (default: 'models').
        logs_dir (str): Folder for TensorBoard logs (default: 'logs').
    """
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    tb_log_dir = os.path.join(logs_dir, f"run_{timestamp}")

    logger.info("=" * 60)
    logger.info("Starting Earthworm AI - EfficientNet-B0 Training Pipeline")
    logger.info(f"Dataset Path: {data_dir}")
    logger.info(f"Output Directory: {output_dir}")
    logger.info("=" * 60)

    # 1. Load Dataset
    train_ds, val_ds, class_names = load_datasets(
        data_dir=data_dir,
        img_size=IMAGE_SIZE,
        batch_size=batch_size,
    )
    num_classes = len(class_names)

    # Save detected class names for prediction service
    class_names_path = os.path.join(output_dir, "class_names.json")
    save_class_names(class_names, class_names_path)

    # 2. Build Model
    model, base_model = build_model(num_classes=num_classes, input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3))

    # 3. Setup Callbacks
    checkpoint_keras_path = os.path.join(output_dir, "plant_disease_model.keras")

    callbacks_stage1 = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_keras_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.TensorBoard(
            log_dir=os.path.join(tb_log_dir, "stage1"),
            histogram_freq=1,
        ),
    ]

    # 4. Stage 1 Training (Frozen Backbone)
    logger.info("-" * 60)
    logger.info(f"STAGE 1: Training Classification Head for {epochs_stage1} Epochs (lr={lr_stage1})")
    logger.info("-" * 60)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_stage1),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"],
    )

    history_stage1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_stage1,
        callbacks=callbacks_stage1,
    )

    # 5. Stage 2 Fine-Tuning (Unfreeze top 20 layers of EfficientNet-B0)
    logger.info("-" * 60)
    logger.info(f"STAGE 2: Fine-Tuning Top 20 Layers for {epochs_stage2} Epochs (lr={lr_stage2})")
    logger.info("-" * 60)

    model = unfreeze_for_finetuning(model, base_model, num_unfreeze_layers=20)

    callbacks_stage2 = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=4,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_keras_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.TensorBoard(
            log_dir=os.path.join(tb_log_dir, "stage2"),
            histogram_freq=1,
        ),
    ]

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_stage2),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"],
    )

    history_stage2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_stage1 + epochs_stage2,
        initial_epoch=epochs_stage1,
        callbacks=callbacks_stage2,
    )

    # 6. Save Model in Both .keras and .h5 formats
    logger.info("Saving final model formats...")
    # .keras format
    model.save(checkpoint_keras_path)
    logger.info(f"Saved model (.keras): {checkpoint_keras_path}")

    # .h5 format
    checkpoint_h5_path = os.path.join(output_dir, "plant_disease_model.h5")
    try:
        model.save(checkpoint_h5_path)
        logger.info(f"Saved model (.h5): {checkpoint_h5_path}")
    except Exception as e:
        logger.warning(f"Could not save in H5 format directly: {e}. Saving legacy H5 weights.")
        model.save_weights(os.path.join(output_dir, "plant_disease_model_weights.h5"))

    # 7. Evaluate and Plot History
    logger.info("-" * 60)
    logger.info("Evaluating Model Performance and Generating Visualizations")
    logger.info("-" * 60)

    evaluate_model(model, val_ds, class_names, output_dir=output_dir)
    plot_training_history(history_stage1, history_stage2, output_dir=output_dir)

    logger.info("=" * 60)
    logger.info("Training Pipeline Completed Successfully!")
    logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="Earthworm AI - EfficientNet-B0 Plant Disease Classifier Trainer")
    parser.add_argument("--data_dir", type=str, required=True, help="Directory path containing image dataset subfolders")
    parser.add_argument("--epochs_stage1", type=int, default=10, help="Stage 1 training epochs (default: 10)")
    parser.add_argument("--epochs_stage2", type=int, default=5, help="Stage 2 fine-tuning epochs (default: 5)")
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE, help=f"Batch size (default: {BATCH_SIZE})")
    parser.add_argument("--lr_stage1", type=float, default=0.001, help="Stage 1 initial learning rate (default: 0.001)")
    parser.add_argument("--lr_stage2", type=float, default=1e-5, help="Stage 2 fine-tuning learning rate (default: 1e-5)")
    parser.add_argument("--output_dir", type=str, default="models", help="Directory path to save trained models")
    parser.add_argument("--logs_dir", type=str, default="logs", help="Directory path to save TensorBoard logs")

    args = parser.parse_args()

    run_training(
        data_dir=args.data_dir,
        epochs_stage1=args.epochs_stage1,
        epochs_stage2=args.epochs_stage2,
        batch_size=args.batch_size,
        lr_stage1=args.lr_stage1,
        lr_stage2=args.lr_stage2,
        output_dir=args.output_dir,
        logs_dir=args.logs_dir,
    )


if __name__ == "__main__":
    main()
