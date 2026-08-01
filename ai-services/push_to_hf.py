"""
push_to_hf.py - Script to Push Trained Model & Artifacts to Hugging Face Hub.

Usage:
    python push_to_hf.py --repo_id "username/plant-disease-ai" --token "hf_xxx"
    
Alternatively set environment variables:
    export HF_REPO_ID="username/plant-disease-ai"
    export HF_TOKEN="hf_xxx"
    python push_to_hf.py
"""

import argparse
import os
import sys
from huggingface_hub import HfApi, create_repo
from utils import get_logger

logger = get_logger("PushToHF")


def upload_model_to_hf(
    repo_id: str,
    token: str | None = None,
    models_dir: str = "models",
    model_filename: str = "plant_disease_model.keras",
    class_names_filename: str = "class_names.json",
    private: bool = False,
):
    """
    Uploads the trained Keras model and class names JSON to Hugging Face Model Hub.
    """
    # Clean repo_id if user passed a full Hugging Face URL
    if "huggingface.co/" in repo_id:
        repo_id = repo_id.split("huggingface.co/")[-1].strip("/")

    api = HfApi(token=token)

    logger.info(f"Ensuring Hugging Face repository '{repo_id}' exists...")
    try:
        create_repo(repo_id=repo_id, token=token, repo_type="model", private=private, exist_ok=True)
        logger.info(f"Repository '{repo_id}' is ready.")
    except Exception as e:
        logger.error(f"Failed to create/access repository '{repo_id}': {e}")
        raise

    model_path = os.path.join(models_dir, model_filename)
    class_names_path = os.path.join(models_dir, class_names_filename)

    # Validate files exist
    if not os.path.exists(model_path):
        alt_model_path = os.path.join(models_dir, "plant_disease_model.h5")
        if os.path.exists(alt_model_path):
            model_path = alt_model_path
            model_filename = "plant_disease_model.h5"
        else:
            raise FileNotFoundError(f"Model file not found at '{model_path}'")

    if not os.path.exists(class_names_path):
        raise FileNotFoundError(f"Class names file not found at '{class_names_path}'")

    # Upload model weights
    logger.info(f"Uploading '{model_path}' to Hugging Face '{repo_id}/{model_filename}'...")
    api.upload_file(
        path_or_fileobj=model_path,
        path_in_repo=model_filename,
        repo_id=repo_id,
        repo_type="model",
    )
    logger.info(f"Successfully uploaded '{model_filename}'!")

    # Upload class names JSON
    logger.info(f"Uploading '{class_names_path}' to Hugging Face '{repo_id}/{class_names_filename}'...")
    api.upload_file(
        path_or_fileobj=class_names_path,
        path_in_repo=class_names_filename,
        repo_id=repo_id,
        repo_type="model",
    )
    logger.info(f"Successfully uploaded '{class_names_filename}'!")

    print("\n" + "=" * 60)
    print(f"SUCCESS: Model artifacts successfully pushed to Hugging Face Hub!")
    print(f"Repo URL: https://huggingface.co/{repo_id}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Upload Earthworm AI Model to Hugging Face Hub")
    parser.add_argument("--repo_id", type=str, default=os.getenv("HF_REPO_ID"), help="Hugging Face repo ID (e.g., 'username/plant-disease-ai')")
    parser.add_argument("--token", type=str, default=os.getenv("HF_TOKEN"), help="Hugging Face access token")
    parser.add_argument("--models_dir", type=str, default="models", help="Directory containing trained model files")
    parser.add_argument("--private", action="store_true", help="Set repository to private")

    args = parser.parse_args()

    if not args.repo_id:
        logger.error("Hugging Face repo ID is required! Use --repo_id 'your-username/your-repo' or set HF_REPO_ID environment variable.")
        sys.exit(1)

    upload_model_to_hf(
        repo_id=args.repo_id,
        token=args.token,
        models_dir=args.models_dir,
        private=args.private,
    )


if __name__ == "__main__":
    main()
