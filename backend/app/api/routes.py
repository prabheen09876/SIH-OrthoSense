from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES
from app.ml.inference import ModelNotLoadedError, model_status, predict
from app.ml.preprocessing import InvalidImageError

router = APIRouter()

_READ_CHUNK_BYTES = 1024 * 1024  # 1 MB


async def _read_within_limit(file: UploadFile, max_bytes: int) -> bytes:
    """Read the upload in bounded chunks, aborting as soon as the limit is
    exceeded instead of buffering an unbounded body into memory first."""
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(_READ_CHUNK_BYTES)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Image exceeds the {max_bytes // (1024 * 1024)} MB upload limit.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


@router.get("/health")
def health():
    return {"status": "ok", "model": model_status()}


@router.post("/predict")
async def predict_route(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Upload a JPEG, PNG, or WEBP image.",
        )

    contents = await _read_within_limit(file, MAX_UPLOAD_BYTES)
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = predict(contents)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # unexpected inference failure
        raise HTTPException(status_code=500, detail="Inference failed unexpectedly.") from exc

    return {"filename": file.filename, **result}
