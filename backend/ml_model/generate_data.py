import pandas as pd
import numpy as np
import os

np.random.seed(42)
n_samples = 500

# Service type encoded as numbers
# 0=general, 1=specialist, 2=followup, 3=dental, 4=banking, 5=government
service_types = np.random.randint(0, 6, n_samples)

# Hour of day (8am to 5pm)
hours = np.random.randint(8, 18, n_samples)

# Day of week (0=Monday to 4=Friday)
day_of_week = np.random.randint(0, 5, n_samples)

# Base service duration by type (realistic estimates in minutes)
base_duration = {
    0: 8,   # general
    1: 20,  # specialist
    2: 10,  # followup
    3: 15,  # dental
    4: 12,  # banking
    5: 18,  # government
}

# Calculate realistic duration with some noise
durations = []
for i in range(n_samples):
    base = base_duration[service_types[i]]
    # morning rush adds time
    morning_factor = 1.3 if hours[i] < 11 else 1.0
    # monday is busier
    day_factor = 1.2 if day_of_week[i] == 0 else 1.0
    noise = np.random.normal(0, 2)
    duration = max(5, (base * morning_factor * day_factor) + noise)
    durations.append(round(duration, 1))

df = pd.DataFrame({
    'service_type': service_types,
    'hour_of_day': hours,
    'day_of_week': day_of_week,
    'duration_minutes': durations
})

output_path = os.path.join(os.path.dirname(__file__), 'training_data.csv')
df.to_csv(output_path, index=False)
print(f"Generated {n_samples} training samples")
print(df.groupby('service_type')['duration_minutes'].mean().round(1))