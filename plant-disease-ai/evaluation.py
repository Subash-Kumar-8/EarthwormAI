"""
evaluation.py - Model Evaluation and Visualization Module.

Generates evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix,
Classification Report) and plots stage 1 & stage 2 training history curves.
"""

import os
from typing import Dict, List, Optional, Any
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import tensorflow as tf

from utils import get_logger

logger = get_logger("Evaluation")


def evaluate_model(
    model: tf.keras.Model,
    val_ds: tf.data.Dataset,
    class_names: List[str],
    output_dir: str = "models",
) -> Dict[str, Any]:
    """
    Evaluates trained model on validation dataset and computes comprehensive metrics.

    Calculates:
    - Overall Accuracy
    - Weighted Precision
    - Weighted Recall
    - Weighted F1 Score
    - Classification Report
    - Confusion Matrix (plots and saves heatmap)

    Args:
        model (tf.keras.Model): Trained Keras model.
        val_ds (tf.data.Dataset): Validation dataset.
        class_names (List[str]): List of target class labels.
        output_dir (str): Directory where confusion matrix plot will be saved.

    Returns:
        Dict[str, Any]: Calculated metrics dictionary.
    """
    logger.info("Evaluating model on validation dataset...")
    os.makedirs(output_dir, exist_ok=True)

    y_true = []
    y_pred = []

    # Iterate over validation dataset to obtain ground truth and predictions
    for images, labels in val_ds:
        preds = model.predict(images, verbose=0)
        pred_classes = np.argmax(preds, axis=1)
        
        y_true.extend(labels.numpy())
        y_pred.extend(pred_classes)

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Compute metrics
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    class_report_str = classification_report(y_true, y_pred, target_names=class_names, zero_division=0)

    logger.info(f"Validation Accuracy:  {acc * 100:.2f}%")
    logger.info(f"Validation Precision: {prec * 100:.2f}%")
    logger.info(f"Validation Recall:    {rec * 100:.2f}%")
    logger.info(f"Validation F1-Score:  {f1 * 100:.2f}%")
    logger.info(f"\nClassification Report:\n{class_report_str}")

    # Generate and plot confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(max(8, len(class_names)), max(6, len(class_names) * 0.8)))
    cax = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    fig.colorbar(cax)

    ax.set_xticks(np.arange(len(class_names)))
    ax.set_yticks(np.arange(len(class_names)))
    ax.set_xticklabels(class_names, rotation=45, ha="right")
    ax.set_yticklabels(class_names)

    # Annotate counts in heatmap cells
    thresh = cm.max() / 2.0 if cm.max() > 0 else 1.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j,
                i,
                format(cm[i, j], "d"),
                ha="center",
                va="center",
                color="white" if cm[i, j] > thresh else "black",
            )

    plt.title("Confusion Matrix - Earthworm AI Plant Disease Classifier", fontsize=14, pad=15)
    plt.xlabel("Predicted Class", fontsize=12)
    plt.ylabel("True Class", fontsize=12)
    plt.tight_layout()

    cm_path = os.path.join(output_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=300)
    plt.close()
    logger.info(f"Saved confusion matrix visualization to {cm_path}")

    metrics = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "classification_report": class_report_str,
        "confusion_matrix": cm.tolist(),
    }

    return metrics


def plot_training_history(
    history_stage1: tf.keras.callbacks.History,
    history_stage2: Optional[tf.keras.callbacks.History] = None,
    output_dir: str = "models",
) -> str:
    """
    Plots training and validation accuracy and loss curves across training stages.

    Args:
        history_stage1 (History): History object from initial training (Stage 1).
        history_stage2 (Optional[History]): History object from fine-tuning (Stage 2).
        output_dir (str): Output directory to save the plot figure.

    Returns:
        str: Saved plot file path.
    """
    logger.info("Generating training history curves...")
    os.makedirs(output_dir, exist_ok=True)

    acc = list(history_stage1.history.get("accuracy", []))
    val_acc = list(history_stage1.history.get("val_accuracy", []))
    loss = list(history_stage1.history.get("loss", []))
    val_loss = list(history_stage1.history.get("val_loss", []))

    stage1_epochs = len(acc)

    if history_stage2 is not None:
        acc.extend(history_stage2.history.get("accuracy", []))
        val_acc.extend(history_stage2.history.get("val_accuracy", []))
        loss.extend(history_stage2.history.get("loss", []))
        val_loss.extend(history_stage2.history.get("val_loss", []))

    epochs_range = range(1, len(acc) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy Plot
    axes[0].plot(epochs_range, acc, label="Training Accuracy", marker="o", color="#1f77b4")
    axes[0].plot(epochs_range, val_acc, label="Validation Accuracy", marker="s", color="#ff7f0e")
    if history_stage2 is not None and stage1_epochs > 0:
        axes[0].axvline(
            x=stage1_epochs + 0.5,
            color="red",
            linestyle="--",
            label="Start Fine-Tuning",
        )
    axes[0].set_title("Training & Validation Accuracy", fontsize=13, fontweight="bold")
    axes[0].set_xlabel("Epochs", fontsize=11)
    axes[0].set_ylabel("Accuracy", fontsize=11)
    axes[0].legend(loc="lower right")
    axes[0].grid(True, linestyle=":", alpha=0.6)

    # Loss Plot
    axes[1].plot(epochs_range, loss, label="Training Loss", marker="o", color="#1f77b4")
    axes[1].plot(epochs_range, val_loss, label="Validation Loss", marker="s", color="#ff7f0e")
    if history_stage2 is not None and stage1_epochs > 0:
        axes[1].axvline(
            x=stage1_epochs + 0.5,
            color="red",
            linestyle="--",
            label="Start Fine-Tuning",
        )
    axes[1].set_title("Training & Validation Loss", fontsize=13, fontweight="bold")
    axes[1].set_xlabel("Epochs", fontsize=11)
    axes[1].set_ylabel("Loss", fontsize=11)
    axes[1].legend(loc="upper right")
    axes[1].grid(True, linestyle=":", alpha=0.6)

    plt.tight_layout()
    plot_path = os.path.join(output_dir, "training_history.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()

    logger.info(f"Saved training history curves to {plot_path}")
    return plot_path
