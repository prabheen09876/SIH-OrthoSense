"""OrdinalDenseNet architecture: DenseNet-121 backbone with an ordinal
classification head. Mirrors the architecture trained in ml/Osteoarthritis.ipynb
(cell 16) so that backend/models/best_ordinal_densenet.pth loads correctly.
"""
import torch.nn as nn
import torchvision.models as models


class OrdinalDenseNet(nn.Module):
    def __init__(self, num_features: int = 1024, num_thresholds: int = 2, dropout: float = 0.3):
        super().__init__()
        backbone = models.densenet121(weights=None)
        backbone.classifier = nn.Identity()
        self.backbone = backbone
        self.dropout = nn.Dropout(dropout)
        self.ordinal_head = nn.Linear(num_features, num_thresholds)

    def forward(self, x):
        features = self.backbone(x)
        features = self.dropout(features)
        return self.ordinal_head(features)
