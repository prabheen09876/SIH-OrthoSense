import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
CHECKPOINT_PATH = Path(os.getenv("MODEL_CHECKPOINT_PATH", BACKEND_DIR / "models" / "best_ordinal_densenet.pth"))

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", 10 * 1024 * 1024))  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
