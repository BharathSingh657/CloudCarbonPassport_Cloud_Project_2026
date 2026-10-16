# Cloud Carbon Forecasting ML Engine

The machine learning engine in `src/ml_model` provides predictive modeling and multi-step time-series forecasting for cloud workload carbon footprints.

## Model Training & Inference

- **Training Script**: `src/ml_model/train_carbon_forecaster.py`
- **Trained Artifact**: `src/ml_model/carbon_forecaster.joblib`
- **Evaluation Summary**: `src/ml_model/carbon_forecaster_summary.json`
- **Inference CLI**: `src/ml_model/predict_carbon_forecast.py`
- **Evaluation Report**: `results/model_evaluation_report.md`

### Training Data & Architecture
- **Dataset**: `dataset/processed/carbon_timeseries_dataset.csv` (8,640 records across 45 days).
- **Algorithm**: Random Forest Regressor (100 estimators, max depth 14).
- **Features**: Lagged carbon emissions (t-1h, t-2h, t-24h), rolling statistics (6h/24h mean and std), cyclical hour/day sine and cosine encodings, resource hardware profile features (vCPU count, TDP wattage, idle wattage, regional carbon intensity).
- **Validation**: Strict chronological holdout (final 20% of timeline as unseen test set).
- **Metrics**:
  - Test $R^2 = 0.8929$
  - Test $\text{MAE} = 0.0033\text{ kg CO}_2\text{e}$
  - Test $\text{RMSE} = 0.0051\text{ kg CO}_2\text{e}$

Run model training at any time with:
```powershell
python src/ml_model/train_carbon_forecaster.py
```

