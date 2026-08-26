"""Image preprocessing for OrdinalDenseNet inference.

Matches the eval_transform used during training/validation in
ml/Osteoarthritis.ipynb (cell 8): 224x224 resize + ImageNet normalization,
no augmentation.
"""
import io

from PIL import Image, UnidentifiedImageError
from torchvision import transforms

IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

eval_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


class InvalidImageError(ValueError):
    pass


def load_image(raw_bytes: bytes) -> Image.Image:
    try:
        return Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise InvalidImageError("File is not a readable image.") from exc


def preprocess(image: Image.Image):
    return eval_transform(image).unsqueeze(0)
