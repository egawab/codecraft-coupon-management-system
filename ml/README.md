# ML/AI Models for Kobonz

> **Note**: This is the ML infrastructure. Models are not yet trained.
> This provides the structure for AI-based features.

## 📊 Overview

Machine learning models for personalized coupon recommendations and intelligent search.

## 🎯 Models

### 1. Coupon Recommender
- **Type**: Collaborative Filtering + Content-Based Hybrid
- **Framework**: TensorFlow/PyTorch
- **Input**: User features, Coupon features, Context
- **Output**: Recommendation scores (0-1)

### 2. Search Ranking
- **Type**: Learning to Rank
- **Framework**: LightGBM/XGBoost
- **Input**: Query, Coupon features, User context
- **Output**: Relevance scores

### 3. User Embeddings
- **Type**: Neural Embedding
- **Purpose**: Represent users in latent space
- **Dimensions**: 64-128

## 📂 Structure

```
ml/
├── models/              # Trained models
│   ├── recommender/
│   │   ├── model.json
│   │   └── weights.bin
│   └── embeddings/
├── training/            # Training scripts
│   ├── train_recommender.py
│   ├── train_embeddings.py
│   └── feature_pipeline.py
├── api/                 # ML API service
│   ├── main.py
│   └── inference.py
└── notebooks/           # Jupyter notebooks
```

## 🚀 Training

```bash
# Install dependencies
pip install -r requirements.txt

# Train recommender model
python training/train_recommender.py

# Export to TensorFlow.js
tensorflowjs_converter \
  --input_format=keras \
  ./models/recommender.h5 \
  ./models/recommender/
```

## 🔄 Inference

### Client-Side (TensorFlow.js)
```typescript
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/models/recommender/model.json');
const prediction = model.predict(features);
```

### Server-Side (Python API)
```python
from inference import RecommenderModel

model = RecommenderModel()
recommendations = model.predict(user_id, context)
```

## 📈 Features

See `src/features/recommendations/services/feature-engineering.ts` for feature extraction.

---

**Status**: Structure prepared, training pending
