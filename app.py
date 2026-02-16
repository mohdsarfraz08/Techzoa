from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)

@app.route("/")
def index():
    return app.send_static_file("index.html")

# Comprehensive list matching the SVG map
STATES = [
    "Jammu and Kashmir", "Himachal Pradesh", "Punjab", "Uttarakhand", "Haryana",
    "Rajasthan", "Uttar Pradesh", "Bihar", "Sikkim", "Arunachal Pradesh",
    "Assam", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya",
    "West Bengal", "Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh",
    "Gujarat", "Maharashtra", "Goa", "Karnataka", "Telangana",
    "Andhra Pradesh", "Kerala", "Tamil Nadu"
]

# Cities with approximate SVG coordinates (x, y) based on viewBox="0 0 612 696"
CITIES = {
    "Delhi": {"x": 190, "y": 210},
    "Mumbai": {"x": 125, "y": 450},
    "Kolkata": {"x": 460, "y": 360},
    "Chennai": {"x": 290, "y": 580},
    "Bangalore": {"x": 180, "y": 560},
    "Hyderabad": {"x": 220, "y": 480},
    "Ahmedabad": {"x": 80, "y": 330},
    "Pune": {"x": 135, "y": 460},
    "Jaipur": {"x": 160, "y": 250},
    "Lucknow": {"x": 300, "y": 250},
    "Srinagar": {"x": 150, "y": 80},
    "Guwahati": {"x": 500, "y": 260}
}

# Store previous state to simulate realistic trends (Random Walk)
state_data_store = {}
city_data_store = {}

def get_trend_value(current_val, min_val, max_val, volatility=0.1):
    change = random.uniform(-volatility, volatility)
    new_val = current_val + change
    return max(min_val, min(new_val, max_val))

# Initialize store
for s in STATES:
    state_data_store[s] = {
        "wind": random.uniform(5, 20),
        "rain": random.uniform(0, 10),
        "prob": random.uniform(0.1, 0.4)
    }

for c in CITIES:
    city_data_store[c] = {
        "wind": random.uniform(5, 20),
        "rain": random.uniform(0, 10),
        "prob": random.uniform(0.1, 0.4)
    }

@app.route("/live-risk")
def live_risk():
    data = []
    
    # Process States
    for state in STATES:
        # Update values with random walk
        prev = state_data_store[state]
        
        # Volatility varies by state (mock logic)
        vol = 0.5
        if state in ["Kerala", "Assam", "Odisha"]: vol = 1.5 # More volatile
        
        new_wind = round(get_trend_value(prev["wind"], 0, 120, vol), 1)
        new_rain = round(get_trend_value(prev["rain"], 0, 300, vol), 1)
        new_prob = round(get_trend_value(prev["prob"], 0.0, 1.0, 0.05), 2)
        
        # Determine Severity
        severity = "LOW"
        reasons = []
        
        if new_prob > 0.7 or (new_wind > 80 and new_rain > 100):
            severity = "HIGH"
            reasons.append("Critical wind speeds predicted")
            reasons.append("Heavy rainfall accumulation")
        elif new_prob > 0.4 or new_wind > 50:
            severity = "MEDIUM"
            reasons.append("Moderate storm capability")
        else:
            reasons.append("Conditions within safety norms")
            
        # Update store
        state_data_store[state] = {
            "wind": new_wind,
            "rain": new_rain,
            "prob": new_prob
        }
        
        data.append({
            "type": "state",
            "name": state,
            "severity": severity,
            "probability": new_prob,
            "wind_speed": new_wind,
            "rain_mm": new_rain,
            "reason": reasons,
            "last_updated": datetime.now().strftime("%H:%M:%S")
        })

    # Process Cities
    for city, coords in CITIES.items():
        prev = city_data_store[city]
        
        # Volatility
        vol = 0.8 # Cities feel more volatility in this sim
        
        new_wind = round(get_trend_value(prev["wind"], 0, 120, vol), 1)
        new_rain = round(get_trend_value(prev["rain"], 0, 300, vol), 1)
        new_prob = round(get_trend_value(prev["prob"], 0.0, 1.0, 0.05), 2)
        
        severity = "LOW"
        reasons = []
        
        if new_prob > 0.7 or (new_wind > 80 and new_rain > 100):
            severity = "HIGH"
            reasons.append("Urban flooding risk")
            reasons.append("High wind alert")
        elif new_prob > 0.4 or new_wind > 50:
            severity = "MEDIUM"
            reasons.append("Moderate precautionary advisory")
        else:
            reasons.append("Normal city activity")
            
        city_data_store[city] = {
            "wind": new_wind,
            "rain": new_rain,
            "prob": new_prob
        }
        
        data.append({
            "type": "city",
            "name": city,
            "x": coords["x"],
            "y": coords["y"],
            "severity": severity,
            "probability": new_prob,
            "wind_speed": new_wind,
            "rain_mm": new_rain,
            "reason": reasons,
            "last_updated": datetime.now().strftime("%H:%M:%S")
        })

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
