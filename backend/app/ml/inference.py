"""Production inference for the osteoarthritis grading model.

Pipeline: raw image bytes -> preprocess -> OrdinalDenseNet -> sigmoid
thresholds -> ordinal decode -> structured prediction.

The model is loaded once at import time and reused for every request.
"""
import logging

import torch

from app.core.config import CHECKPOINT_PATH
from app.ml.model import OrdinalDenseNet
from app.ml.preprocessing import load_image, preprocess

logger = logging.getLogger(__name__)

NUM_CLASSES = 3

DISCLAIMER = (
    "This is an AI model prediction, not a medical diagnosis. "
    "Findings should be reviewed by a qualified healthcare professional before any clinical decision is made."
)

CLASS_INFO = {
    0: {
        "name": "Grade 0 (Normal / Healthy)",
        "badge": "Normal",
        "severity": "Low Risk",
        "description": "The model did not detect radiographic signs of osteoarthritis. Joint space width and cartilage contour appear within normal limits.",
        "recommendation": "Continue routine monitoring and low-impact activity as usual.",
    },
    1: {
        "name": "Grade 1 (Mild / Moderate)",
        "badge": "Moderate",
        "severity": "Medium Risk",
        "description": "The model detected mild-to-moderate signs of osteoarthritis, including possible early joint space narrowing and osteophytic changes.",
        "recommendation": "Consider a clinical evaluation with a joint specialist to confirm these findings and discuss physical therapy or lifestyle adjustments.",
    },
    2: {
        "name": "Grade 2 (Severe)",
        "badge": "Severe",
        "severity": "High Risk",
        "description": "The model detected marked signs of osteoarthritis, including joint space narrowing, sclerosis, and bone contour changes consistent with advanced disease.",
        "recommendation": "Consider a prompt orthopedic evaluation to confirm these findings and discuss appropriate treatment options.",
    },
}


class ModelNotLoadedError(RuntimeError):
    pass


def _load_model() -> tuple[OrdinalDenseNet | None, torch.device, dict]:
    device = torch.device(
        "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    )
    model = OrdinalDenseNet(num_features=1024, num_thresholds=NUM_CLASSES - 1)

    if not CHECKPOINT_PATH.exists():
        logger.warning("Model checkpoint not found at %s", CHECKPOINT_PATH)
        return None, device, {}

    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device)
    meta: dict = {}
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
        meta = {"epoch": checkpoint.get("epoch"), "best_qwk": checkpoint.get("best_qwk")}
    else:
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()
    logger.info("Loaded OrdinalDenseNet checkpoint from %s on %s", CHECKPOINT_PATH, device)
    return model, device, meta


_model, _device, _checkpoint_meta = _load_model()


def is_ready() -> bool:
    return _model is not None


def model_status() -> dict:
    return {
        "loaded": is_ready(),
        "device": str(_device),
        "checkpoint": _checkpoint_meta,
        "architecture": "OrdinalDenseNet-121",
        "num_classes": NUM_CLASSES,
    }


def predict(image_bytes: bytes) -> dict:
    if _model is None:
        raise ModelNotLoadedError("Model checkpoint is not loaded on the server.")

    image = load_image(image_bytes)
    tensor = preprocess(image).to(_device)

    with torch.no_grad():
        logits = _model(tensor)
        probs = torch.sigmoid(logits)
        threshold_probs = probs.squeeze(0).cpu().tolist()  # [P(grade > 0), P(grade > 1)]

        predicted_class = min(int((probs >= 0.5).sum(dim=1).item()), NUM_CLASSES - 1)

        p0 = 1.0 - threshold_probs[0]
        p1 = threshold_probs[0] * (1.0 - threshold_probs[1])
        p2 = threshold_probs[1]
        class_distribution = {"0": round(p0, 4), "1": round(p1, 4), "2": round(p2, 4)}
        confidence = round(class_distribution[str(predicted_class)], 4)

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "class_details": CLASS_INFO[predicted_class],
        "class_distribution": class_distribution,
        "threshold_probabilities": [round(p, 4) for p in threshold_probs],
        "image_size": f"{image.width}x{image.height}",
        "disclaimer": DISCLAIMER,
    }
