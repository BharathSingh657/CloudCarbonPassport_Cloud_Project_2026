from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = PROJECT_ROOT / "dataset" / "raw" / "cloud_carbon_telemetry_dataset.csv"
MODEL_PATH = PROJECT_ROOT / "src" / "ml_model" / "carbon_predictor.joblib"
SUMMARY_PATH = PROJECT_ROOT / "src" / "ml_model" / "carbon_model_summary.json"


def load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATASET_PATH)
    required_columns = {
        "resource_id",
        "resource_name",
        "service",
        "instance_type",
        "region",
        "status",
        "cpu_utilization_pct",
        "memory_utilization_pct",
        "storage_gb",
        "power_watts",
        "total_kwh",
        "carbon_intensity_gco2_kwh",
        "carbon_emissions_kg_co2",
        "renewable_pct",
        "sustainability_score",
    }

    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")

    return df


def build_model_pipeline() -> Pipeline:
    numeric_features = [
        "cpu_utilization_pct",
        "memory_utilization_pct",
        "storage_gb",
        "power_watts",
        "total_kwh",
        "carbon_intensity_gco2_kwh",
        "renewable_pct",
        "sustainability_score",
    ]
    categorical_features = ["service", "instance_type", "region", "status"]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([("imputer", SimpleImputer(strategy="median"))]),
                numeric_features,
            ),
            (
                "cat",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                categorical_features,
            ),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        max_depth=8,
        min_samples_leaf=1,
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])


def main() -> None:
    df = load_dataset()

    target = "carbon_emissions_kg_co2"
    feature_columns = [
        "cpu_utilization_pct",
        "memory_utilization_pct",
        "storage_gb",
        "power_watts",
        "total_kwh",
        "carbon_intensity_gco2_kwh",
        "renewable_pct",
        "sustainability_score",
        "service",
        "instance_type",
        "region",
        "status",
    ]

    X = df[feature_columns]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    pipeline = build_model_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    summary = {
        "dataset_path": str(DATASET_PATH),
        "rows": int(len(df)),
        "target": target,
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "metrics": {
            "MAE_kg_co2": round(float(mae), 4),
            "R2": round(float(r2), 4),
        },
        "notes": [
            "This is a lightweight proof-of-concept carbon prediction model using actual infrastructure telemetry.",
            "It is designed to demonstrate data-based analysis rather than a production AWS forecasting pipeline.",
        ],
    }

    joblib.dump(pipeline, MODEL_PATH)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print("Model trained successfully.")
    print(f"MAE: {mae:.4f} kg CO₂")
    print(f"R²: {r2:.4f}")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Summary saved to: {SUMMARY_PATH}")


if __name__ == "__main__":
    main()
