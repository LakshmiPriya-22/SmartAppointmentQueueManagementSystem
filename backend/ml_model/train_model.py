import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os

# Load data
data_path = os.path.join(os.path.dirname(__file__), 'training_data.csv')
df = pd.read_csv(data_path)

# Features and target
X = df[['service_type', 'hour_of_day', 'day_of_week']]
y = df['duration_minutes']

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Model trained successfully")
print(f"Mean Absolute Error: {mae:.2f} minutes")
print(f"This means predictions are off by ~{mae:.1f} minutes on average")

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'wait_time_model.pkl')
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")

# Test a prediction
sample = pd.DataFrame([{
    'service_type': 1,  # specialist
    'hour_of_day': 9,   # 9am
    'day_of_week': 0    # Monday
}])
prediction = model.predict(sample)[0]
print(f"Sample prediction (specialist, 9am Monday): {prediction:.1f} minutes")