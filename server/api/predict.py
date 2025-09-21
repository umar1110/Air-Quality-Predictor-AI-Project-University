from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import os

# Load model and scaler
model = joblib.load('aqi_model.pkl')
scaler = joblib.load('scaler.pkl')

# Your trained features order (must match training X.columns)
feature_names = ['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 
                 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene']

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json  # Get JSON data from request
        input_data = [data[feature] for feature in feature_names]
        scaled_input = scaler.transform([input_data])
        prediction = model.predict(scaled_input)[0]
        return jsonify({'predicted_AQI': round(prediction, 2)})
    except Exception as e:
        return jsonify({'error': str(e)})

# This is the main handler for Vercel
def handler(request):
    return app(request.environ, lambda *args: None)
