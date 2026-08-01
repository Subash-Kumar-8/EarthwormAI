"""
push_to_hf.py - Push trained model and class labels to Hugging Face Model Hub.

Usage:
    python push_to_hf.py --repo_id "YOUR_USERNAME/EarthwormAI-Plant-Disease" --token "YOUR_HF_TOKEN"
"""

import argparse
import os
import sys
from huggingface_hub import HfApi, create_repo


def upload_to_huggingface(
    repo_id: str,
    model_path: str = "models/plant_disease_model.keras",
    class_names_path: str = "models/class_names.json",
    token: str | None = None,
    private: bool = False,
):
    """
    Uploads trained Keras model and class_names.json to Hugging Face Hub.
    """
    token = token or os.getenv("HF_TOKEN")
    api = HfApi(token=token)

    print(f"--> Creating repository '{repo_id}' on Hugging Face Hub (if it doesn't exist)...")
    try:
        create_repo(repo_id=repo_id, token=token, private=private, exist_ok=True, repo_type="model")
        print(f"--> Repository '{repo_id}' ready.")
    except Exception as e:
        print(f"--> Repository creation note: {e}")

    # Check local files
    if not os.path.exists(model_path):
        alt_path = model_path.replace(".keras", ".h5")
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            raise FileNotFoundError(f"Model file not found at {model_path} or {alt_path}")

    if not os.path.exists(class_names_path):
        raise FileNotFoundError(f"Class names file not found at {class_names_path}")

    # Upload model file
    filename = os.path.basename(model_path)
    print(f"--> Uploading '{model_path}' as '{filename}' to Hugging Face Hub...")
    api.upload_file(
        path_or_fileobj=model_path,
        path_in_repo=filename,
        repo_id=repo_id,
        repo_type="model",
        token=token,
    )
    print(f"[SUCCESS] Uploaded {filename}")

    # Upload class names file
    classes_filename = os.path.basename(class_names_path)
    print(f"--> Uploading '{class_names_path}' as '{classes_filename}' to Hugging Face Hub...")
    api.upload_file(
        path_or_fileobj=class_names_path,
        path_in_repo=classes_filename,
        repo_id=repo_id,
        repo_type="model",
        token=token,
    )
    print(f"[SUCCESS] Uploaded {classes_filename}")

    print("\n" + "=" * 60)
    print(f"SUCCESS: Model & Class labels uploaded to Hugging Face Hub!")
    print(f"Repo URL: https://huggingface.co/{repo_id}")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Upload Earthworm AI Model to Hugging Face Hub")
    parser.add_argument("--repo_id", type=str, required=True, help="Hugging Face repo ID (e.g., username/EarthwormAI-Plant-Disease)")
    parser.add_argument("--token", type=str, default=None, help="Hugging Face User Access Token (or set HF_TOKEN env var)")
    parser.add_argument("--model_path", type=str, default="models/plant_disease_model.keras", help="Path to .keras model file")
    parser.add_argument("--class_names_path", type=str, default="models/class_names.json", help="Path to class_names.json")
    parser.add_argument("--private", action="store_true", help="Set repository to private")

    args = parser.parse_args()

    upload_to_huggingface(
        repo_id=args.repo_id,
        model_path=args.model_path,
        class_names_path=args.class_names_path,
        token=args.token,
        private=args.private,
    )


if __name__ == "__main__":
    main()
