# SIH-OrthoSense

A clinician-facing screening tool for early osteoarthritis (OA) risk, built for North Eastern India. It combines a guided screening workflow with a real AI model that grades knee X-rays for osteoarthritis severity.

The gait/pressure/IMU sensor workflow (patient profile → sensor kit → movement test → report) is a UI prototype with demonstration data. The **X-ray analysis** feature is a real, working ML pipeline: a trained DenseNet-121 ordinal classifier served over a FastAPI backend.

## Architecture

```
frontend/ (React)  --HTTP POST /api/predict-->  backend/ (FastAPI)  -->  backend/ml (PyTorch)  -->  backend/models/best_ordinal_densenet.pth
```

- **Frontend** (`frontend/`) — React + TypeScript + Vite SPA. The `X-ray analysis` page (`/xray`) uploads an image and calls the backend; every other page is unchanged prototype UI.
- **Backend** (`backend/`) — FastAPI service. `POST /api/predict` accepts an image, preprocesses it, runs the model, and returns a structured JSON prediction. The frontend never touches PyTorch, model weights, or file paths directly — only this HTTP API.
- **ML inference** (`backend/app/ml/`) — model architecture, preprocessing, and inference logic, extracted from the training notebook into a single production path (`inference.py`). The model is loaded once at process startup and reused for every request.
- **Model weights** (`backend/models/best_ordinal_densenet.pth`) — the trained checkpoint (see [Model](#model) below).
- **Research material** (`ml/`) — the training notebook, a data-audit notebook, and training history. Not required to run the app; kept for reference/reproducibility. `ml/data/` (the labeled training/val/test image set) is gitignored — see [Dataset](#dataset).

## Folder structure

```
frontend/            React app (Vite, TypeScript, React Router)
  src/pages/          Route-level pages, incl. XrayAnalysis.tsx
  src/services/api.ts  Backend API client
  src/components/      Shared UI (nav shell, 3D scene, charts, toasts)

backend/              FastAPI service
  app/main.py          App entrypoint, CORS
  app/api/routes.py     /api/predict, /api/health
  app/ml/               model.py, preprocessing.py, inference.py
  app/core/config.py     Paths, upload limits, CORS origins (env-driven)
  models/               best_ordinal_densenet.pth (model weights)
  requirements.txt

ml/                   Research/training material (not used at runtime)
  Osteoarthritis.ipynb   Training notebook (source of truth for the model)
  Data_Audit.ipynb       Dataset exploration
  training_history.csv   Per-epoch training metrics
  data/                  Labeled X-ray dataset (gitignored, kept locally)
```

## Installation

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:8000
```

`VITE_API_BASE_URL` is inlined into the JS bundle at build time (standard Vite behavior), not read at runtime. To point a deployed frontend at a deployed backend, set it in `.env` before running `npm run build`, not by changing it after the build is served.

### Backend

Requires Python 3.11+ and the model checkpoint at `backend/models/best_ordinal_densenet.pth` (already present in this repo).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional: override CORS origins, upload limit, checkpoint path
```

The defaults (no `.env` needed) already allow requests from `http://localhost:5173`, so plain `uvicorn app.main:app --reload` works out of the box. If you do create a `.env` to override something, load it explicitly with `--env-file .env` (uvicorn does not read it automatically).

## Running locally

Start the backend first, then the frontend, each in its own terminal:

```bash
# Terminal 1 — backend (http://localhost:8000)
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` and go to **X-ray analysis** in the sidebar (or the "Analyze an X-ray" button on the dashboard) to upload a knee radiograph.

### Checks

```bash
cd frontend && npm run lint && npm run build
```

## ML API

### `POST /api/predict`

Accepts a single knee X-ray image and returns the model's OA grade.

- **Request**: `multipart/form-data` with a `file` field (JPEG, PNG, or WEBP, ≤10 MB).
- **Response** `200`:
  ```json
  {
    "filename": "example.png",
    "predicted_class": 2,
    "confidence": 0.992,
    "class_details": {
      "name": "Grade 2 (Severe)",
      "badge": "Severe",
      "severity": "High Risk",
      "description": "...",
      "recommendation": "..."
    },
    "class_distribution": { "0": 0.0471, "1": 0.0076, "2": 0.992 },
    "threshold_probabilities": [0.9529, 0.992],
    "image_size": "224x224"
  }
  ```
- **Errors**: `400` invalid/missing/wrong-type file, `413` file too large, `422` no file provided, `503` model not loaded, `500` unexpected inference failure. All return `{"detail": "..."}`.

### `GET /api/health`

Returns service and model load status — useful for confirming the checkpoint loaded correctly before relying on `/predict`.

## Model

- **Architecture**: `OrdinalDenseNet` — a DenseNet-121 backbone (`torchvision.models.densenet121`, classifier removed) with a dropout layer and a 2-unit linear "ordinal head" in place of a standard softmax classifier.
- **Task**: 3-class ordinal regression — Grade 0 (normal), Grade 1 (mild/moderate), Grade 2 (severe) knee osteoarthritis from a single radiograph.
- **Input**: RGB image, resized to 224×224, normalized with ImageNet mean/std (`[0.485, 0.456, 0.406]` / `[0.229, 0.224, 0.225]`). No augmentation at inference time.
- **Ordinal decoding**: the head outputs 2 threshold logits (`P(grade > 0)`, `P(grade > 1)`). Sigmoid is applied to each; the predicted grade is the count of thresholds exceeding 0.5. Per-class probabilities are derived from the same two threshold probabilities (see `backend/app/ml/inference.py`).
- **Checkpoint**: trained for 8 epochs, best validation quadratic-weighted kappa (QWK) ≈ 0.737. This is a screening aid, not a diagnostic device.
- **Dependencies**: Python 3.11+, PyTorch 2.13, torchvision 0.28, Pillow 12.3 (pinned in `backend/requirements.txt` to versions verified against this checkpoint).
- **Source of truth**: `ml/Osteoarthritis.ipynb` (training/evaluation). `backend/app/ml/model.py` and `preprocessing.py` are extracted from it and verified to reproduce the same predictions on held-out test images.

## Dataset

`ml/data/` contains the labeled train/val/test knee X-ray images used to train and evaluate the model (grades 0/1/2, ImageFolder layout). It's large (~220 MB) and only needed for retraining or re-evaluating the model — not for running the app — so it's excluded from git via `.gitignore` and kept on disk locally. If you're setting up this repo fresh and need to retrain, restore this folder at `ml/data/{train,val,test}/{0,1,2}/`.

## Model file storage

`backend/models/best_ordinal_densenet.pth` is ~84 MB, under GitHub's 100 MB hard limit, so it can be committed directly. If the repo grows or you deploy somewhere with stricter limits, switch it to [Git LFS](https://git-lfs.com/) (`git lfs track "*.pth"`) rather than removing it from version control.

## Stack

**Frontend**: React, TypeScript, Vite, React Router, Motion, Lucide, Three.js, React Three Fiber, Drei.
**Backend**: FastAPI, PyTorch, torchvision, Pillow, Uvicorn.

The clinical values shown outside the X-ray analysis page are demonstration data. OrthoSense AI is presented as a screening aid, not a diagnostic device.
