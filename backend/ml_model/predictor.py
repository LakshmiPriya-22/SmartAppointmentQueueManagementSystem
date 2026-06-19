import joblib
import os
import pandas as pd

# Map service type string to number
SERVICE_TYPE_MAP = {
    'general': 0,
    'specialist': 1,
    'followup': 2,
    'dental': 3,
    'banking': 4,
    'government': 5,
}

_model = None

def get_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), 'wait_time_model.pkl')
        _model = joblib.load(model_path)
    return _model

def predict_service_duration(service_type: str, hour: int, day_of_week: int) -> int:
    model = get_model()
    service_code = SERVICE_TYPE_MAP.get(service_type, 0)
    features = pd.DataFrame([{
        'service_type': service_code,
        'hour_of_day': hour,
        'day_of_week': day_of_week
    }])
    prediction = model.predict(features)[0]
    return max(5, round(prediction))