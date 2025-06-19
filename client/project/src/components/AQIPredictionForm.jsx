import { useState } from "react";

const AQIPredictionForm = () => {
  const [formData, setFormData] = useState({
    "PM2.5": "",
    PM10: "",
    NO: "",
    NO2: "",
    NOx: "",
    NH3: "",
    CO: "",
    SO2: "",
    O3: "",
    Benzene: "",
    Toluene: "",
    Xylene: "",
  });

  // const [formData, setFormData] = useState({
  //   "PM2.5": 110,
  //   PM10: 150,
  //   NO: 25,
  //   NO2: 40,
  //   NOx: 65,
  //   NH3: 20,
  //   CO: 1.5,
  //   SO2: 12,
  //   O3: 5,
  //   Benzene: 1.2,
  //   Toluene: 2.5,
  //   Xylene: 0.3,
  // });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pollutantLabels = {
    "PM2.5": "PM2.5 (μg/m³)",
    PM10: "PM10 (μg/m³)",
    NO: "NO (ppb)",
    NO2: "NO2 (ppb)",
    NOx: "NOx (ppb)",
    NH3: "NH3 (ppb)",
    CO: "CO (mg/m³)",
    SO2: "SO2 (ppb)",
    O3: "O3 (ppb)",
    Benzene: "Benzene (μg/m³)",
    Toluene: "Toluene (μg/m³)",
    Xylene: "Xylene (μg/m³)",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50)
      return {
        category: "Good",
        color: "from-green-400 to-green-600",
        textColor: "text-white",
      };
    if (aqi <= 100)
      return {
        category: "Moderate",
        color: "from-yellow-400 to-yellow-600",
        textColor: "text-gray-800",
      };
    if (aqi <= 200)
      return {
        category: "Unhealthy for Sensitive Groups",
        color: "from-orange-400 to-orange-600",
        textColor: "text-white",
      };
    return {
      category: "Unhealthy",
      color: "from-red-500 to-red-700",
      textColor: "text-white",
    };
  };

  const predictAQI = async () => {
    // Validate inputs
    const emptyFields = Object.entries(formData).filter(
      ([key, value]) => value === ""
    );

    if (emptyFields.length > 0) {
      setError("Please fill in all fields before predicting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert string values to numbers
      const numericData = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          acc[key] = parseFloat(value);
          return acc;
        },
        {}
      );

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(numericData),
      });

      console.log("data sent to API:", numericData);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response Result:", result);
      setPrediction(result.predicted_AQI || result.aqi || result.prediction);
    } catch (err) {
      setError(`Failed to predict AQI: ${err.message}`);
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      "PM2.5": "",
      PM10: "",
      NO: "",
      NO2: "",
      NOx: "",
      NH3: "",
      CO: "",
      SO2: "",
      O3: "",
      Benzene: "",
      Toluene: "",
      Xylene: "",
    });
    setPrediction(null);
    setError("");
  };

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${
        prediction
          ? `bg-gradient-to-br ${getAQICategory(prediction).color}`
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 transition-colors duration-700 ${
              prediction
                ? getAQICategory(prediction).textColor
                : "text-gray-800"
            }`}
          >
            🌬️ AQI Predictor
          </h1>
          <p
            className={`text-lg md:text-xl transition-colors duration-700 ${
              prediction
                ? getAQICategory(prediction).textColor
                : "text-gray-600"
            }`}
          >
            Enter pollutant concentrations to predict Air Quality Index
          </p>
        </div>

        {/* Main Form Card */}
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 md:p-8 shadow-glass hover:shadow-glass-hover transition-all duration-300">
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(pollutantLabels).map(([key, label]) => (
                <div key={key} className="group">
                  <label
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      prediction
                        ? getAQICategory(prediction).textColor
                        : "text-gray-700"
                    }`}
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-sm 
                             focus:border-white/60 focus:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/20
                             placeholder-gray-500 text-gray-800 font-medium transition-all duration-300
                             group-hover:border-white/40"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <p className="text-red-700 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={predictAQI}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Predicting...
                  </div>
                ) : (
                  "🔮 Predict AQI"
                )}
              </button>

              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30
                         font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105
                         focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                🔄 Reset
              </button>
            </div>

            {/* Prediction Result */}
            {prediction !== null && (
              <div className="animate-bounce-subtle">
                <div className="backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-8 shadow-glass">
                  <div className="text-center">
                    <h2
                      className={`text-2xl md:text-3xl font-bold mb-4 ${
                        getAQICategory(prediction).textColor
                      }`}
                    >
                      🎯 Prediction Result
                    </h2>
                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 mb-4">
                      <div
                        className={`text-5xl md:text-6xl font-bold mb-2 ${
                          getAQICategory(prediction).textColor
                        }`}
                      >
                        {Math.round(prediction)}
                      </div>
                      <div
                        className={`text-xl md:text-2xl font-semibold ${
                          getAQICategory(prediction).textColor
                        }`}
                      >
                        Air Quality Index
                      </div>
                    </div>
                    <div
                      className={`text-lg md:text-xl font-semibold ${
                        getAQICategory(prediction).textColor
                      }`}
                    >
                      Category: {getAQICategory(prediction).category}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
            <h3
              className={`text-xl font-bold mb-4 ${
                prediction
                  ? getAQICategory(prediction).textColor
                  : "text-gray-800"
              }`}
            >
              AQI Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg font-semibold">
                Good (0-50)
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 p-3 rounded-lg font-semibold">
                Moderate (51-100)
              </div>
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-3 rounded-lg font-semibold">
                Unhealthy for Sensitive (101-200)
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-3 rounded-lg font-semibold">
                Unhealthy (201+)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQIPredictionForm;
