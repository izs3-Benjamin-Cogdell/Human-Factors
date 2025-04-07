import React, { useState } from "react";
import "./UserFormPage.css";
import bad from "./images/bad.png";
import ok from "./images/ok.png";
import good from "./images/good.png";
import terrible from "./images/terrible.png";
import great from "./images/great.png";

import coffee from "./images/coffee.png";
import italian from "./images/italian.png";
import mexican from "./images/mexican.png";
import labor from "./images/labor.jpg";
import grocery from "./images/grocery.png";
import tipPredictionModel from "../../models/tippredictionmodel.js";

const moods = [
  { level: 1, image: terrible, label: "Terrible!" },
  { level: 2, image: bad, label: "Bad" },
  { level: 3, image: ok, label: "Okay" },
  { level: 4, image: good, label: "Good" },
  { level: 5, image: great, label: "Great!" },
];

const genre = [
  { level: 1, image: mexican, label: "Mexican" },
  { level: 2, image: italian, label: "Italian" },
  { level: 3, image: coffee, label: "Coffee" },
  { level: 4, image: labor, label: "Labor" },
  { level: 5, image: grocery, label: "Grocery" },
];

const locations = ["Urban", "Suburban", "Rural", "Tourist Area"];
const fancinessLevels = ["Casual", "Moderate", "Fancy"];
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const UserFormPage = () => {
  // Original state variables
  const [billAmount, setBillAmount] = useState("");
  const [location, setLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [fanciness, setFanciness] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [suggestedTip, setSuggestedTip] = useState(null);
  const [timeSpent, setTimeSpent] = useState("");
  
  // New state variables for ML model
  const [day, setDay] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [usingML, setUsingML] = useState(true);
  const [mlError, setMlError] = useState(null);

  // Calculate tip using ML model
  const predictTipML = () => {
    try {
      // Map time of day to binary value (0 for Lunch, 1 for Dinner)
      const timeValue = timeOfDay === "morning" ? 0 : 1;
      
      // Prepare inputs for the model
      const modelInputs = {
        total_bill: parseFloat(billAmount),
        time: timeValue,
        size: parseInt(partySize),
        day: day.charAt(0).toUpperCase() + day.slice(1) // Ensure proper capitalization
      };
      
      console.log("ML Model inputs:", modelInputs);
      
      // Use the linear regression model to predict the tip
      const predictedTip = tipPredictionModel.predict(modelInputs);
      console.log("ML Model predicted tip:", predictedTip);
      
      return predictedTip.toFixed(2);
    } catch (error) {
      console.error("Prediction error:", error);
      setMlError("Error making prediction. Using fallback calculation.");
      return null;
    }
  };

  // Original tip calculation logic as fallback
  const calculateTraditionalTip = () => {
    let tipPercent = 20;
  
    // Genre modifiers
    if (selectedGenre === 3) tipPercent -= 10; // Coffee
    if (selectedGenre === 4) tipPercent -= 10; // Labor
  
    // Location modifiers
    if (location === "Urban") tipPercent += 5;
    if (location === "Tourist Area") tipPercent += 10;
  
    // Time of day modifier
    if (timeOfDay === "morning") tipPercent -= 2;
  
    // Fanciness modifiers
    if (fanciness === "Casual") tipPercent -= 5;
    if (fanciness === "Fancy") tipPercent += 5;
  
    // Satisfaction level (selectedMood)
    switch (selectedMood) {
      case 1: // Terrible
        return Math.min(1, billAmount); // max $1 tip
      case 2: // Bad
        tipPercent -= 18;
        break;
      case 3: // Okay
        tipPercent -= 10;
        break;
      case 4: // Good
        tipPercent = 20;
        break;
      case 5: // Great
        tipPercent += 5;
        break;
      default:
        break;
    }
  
    // Time spent modifier
    const extraTime = Math.max(0, timeSpent - 60);
    const timeBonus = Math.floor(extraTime / 10) * 2;
    tipPercent += timeBonus;
  
    // Final tip calculation
    const tip = (parseFloat(billAmount) * (tipPercent / 100));
  
    // If it's a labor job, apply min $5 and max $100
    if (selectedGenre === 4) {
      return Math.min(Math.max(tip, 5), 100).toFixed(2);
    }
  
    return tip.toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = {
      billAmount,
      location,
      timeOfDay,
      fanciness,
      serviceQuality: selectedMood,
      genre: selectedGenre,
      timeSpent,
      day,
      partySize
    };
  
    console.log("Form Submitted:", formData);
  
    let finalTip;
    
    if (usingML) {
      // Try ML prediction first
      const mlTip = predictTipML();
      if (mlTip !== null) {
        finalTip = mlTip;
        
        // Apply service quality adjustments
        if (selectedMood) {
          const tipValue = parseFloat(mlTip);
          switch (selectedMood) {
            case 1: // Terrible
              finalTip = Math.min(1, billAmount).toFixed(2); // max $1 tip
              break;
            case 2: // Bad
              finalTip = (tipValue * 0.6).toFixed(2); // Reduce by 40%
              break;
            case 3: // Okay
              finalTip = (tipValue * 0.8).toFixed(2); // Reduce by 20%
              break;
            case 4: // Good
              // Keep as is
              break;
            case 5: // Great
              finalTip = (tipValue * 1.2).toFixed(2); // Increase by 20%
              break;
            default:
              break;
          }
        }
      } else {
        // Fallback to traditional calculation if ML fails
        finalTip = calculateTraditionalTip();
      }
    } else {
      // Use traditional calculation if ML is disabled
      finalTip = calculateTraditionalTip();
    }
    
    setSuggestedTip(finalTip);
  };

  return (
    <div className="user-form-page">
      <h2>Suggested Tip Calculator</h2>
      {mlError && <p className="ml-error">{mlError}</p>}
      <form onSubmit={handleSubmit}>
        {/* Bill Amount */}
        <div>
          <label>Bill Amount ($): </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label>Location: </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">-- Select Location --</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Time of Day */}
        <div>
          <label>Time of Day: </label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            required
          >
            <option value="">-- Please select --</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        {/* Day of Week - New field */}
        <div>
          <label>Day of the Week: </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          >
            <option value="">-- Select Day --</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day.toLowerCase()}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Party Size - New field */}
        <div>
          <label>Party Size: </label>
          <input
            type="number"
            min="1"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            required
          />
        </div>

        {/* Fanciness */}
        <div>
          <label>Fanciness Level: </label>
          <select
            value={fanciness}
            onChange={(e) => setFanciness(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {fancinessLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Service Quality (Mood) */}
        <div>
          <label>How was the service? </label>
          <div className="mood-selector">
            {moods.map((mood) => (
              <button
                type="button"
                key={mood.level}
                className={`mood-button ${selectedMood === mood.level ? "selected" : ""}`}
                onClick={() => setSelectedMood(mood.level)}
                title={mood.label}
              >
                <img
                  src={mood.image}
                  alt={mood.label}
                  className="mood-img"
                />
              </button>
            ))}
          </div>
          {selectedMood && <p>You selected: {moods[selectedMood - 1].label}</p>}
        </div>

        {/* Genre Selector */}
        <div>
          <label>What type of restaurant or business was it?</label>
          <div className="mood-selector">
            {genre.map((item) => (
              <button
                type="button"
                key={item.level}
                className={`mood-button ${selectedGenre === item.level ? "selected" : ""}`}
                onClick={() => setSelectedGenre(item.level)}
                title={item.label}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="mood-img"
                />
                <p className="label">{item.label}</p>
              </button>
            ))}
          </div>
          {selectedGenre && <p>You selected: {genre[selectedGenre - 1].label}</p>}
        </div>

        {/* Time Spent */}
        <div>
          <label>Time Spent at the Business (in minutes): </label>
          <input
            type="number"
            min="0"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            required
          />
        </div>

        {/* ML Model Toggle */}
        <div className="ml-toggle">
          <label>
            <input
              type="checkbox"
              checked={usingML}
              onChange={(e) => setUsingML(e.target.checked)}
            />
            Use ML model for prediction
          </label>
        </div>

        {/* Submit */}
        <div style={{ marginTop: "20px" }}>
          <button type="submit">Calculate Tip!</button>
        </div>
      </form>
      
      {suggestedTip && (
        <div className="tip-result">
          <h3>Suggested Tip Amount: ${suggestedTip}</h3>
          <p className="calculation-method">
            {usingML && !mlError ? "Calculated using ML model with service quality adjustments" : "Calculated using traditional method"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserFormPage;