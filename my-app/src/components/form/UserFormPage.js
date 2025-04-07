import React, { useState, useCallback } from "react";
import "./UserFormPage.css";
import bad from "./images/bad.png";
import ok from "./images/ok.png";
import good from "./images/good.png";
import terrible from "./images/terrible.png";
import great from "./images/great.png";

import coffee from "./images/coffee.png";
import italian from "./images/italian.png";
import FastFood from "./images/FastFood.jpeg";
import labor from "./images/labor.jpg";
import grocery from "./images/grocery.png";
import tipPredictionModel from "../../models/tippredictionmodel";

const moods = [
  { level: 1, image: terrible, label: "Terrible!" },
  { level: 2, image: bad, label: "Bad" },
  { level: 3, image: ok, label: "Okay" },
  { level: 4, image: good, label: "Good" },
  { level: 5, image: great, label: "Great!" },
];

const genre = [
  { level: 1, image: FastFood, label: "Fast Food (Takeout)" },
  { level: 2, image: italian, label: "Sit Down" },
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
  const [mlError, setMlError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [breakdownDetails, setBreakdownDetails] = useState(null);
  const resetForm = useCallback(() => {
    setBillAmount("");
    setLocation("");
    setTimeOfDay("");
    setFanciness("");
    setSelectedMood(null);
    setSelectedGenre(null);
    setTimeSpent("");
    setDay("");
    setPartySize(1);
    setSuggestedTip(null);
    setMlError(null);
  }, []);

  // Get the base tip prediction from ML model
  const getMLBaseTip = useCallback(() => {
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
      console.log("ML Model base prediction:", predictedTip);
      
      return predictedTip;
    } catch (error) {
      console.error("ML prediction error:", error);
      setMlError("Error making ML prediction. Using traditional calculation instead.");
      return null;
    }
  }, [billAmount, day, partySize, timeOfDay]);

  // Apply modifiers to the ML base prediction
  const applyModifiers = useCallback((baseTip) => {
    let tipModifier = 1.0; // Start with no modification (100%)
    
    // Genre modifiers
    
    if (selectedGenre === 2) { // sitdown
      tipModifier += 0.25; // 
    }
    if (selectedGenre === 3) { // Coffee
      tipModifier -= 0.1; // -10%
    }
    if (selectedGenre === 4) { // Labor
      tipModifier -= 0.1; // -10%
    }
    if (selectedGenre === 5) { // Coffee
      tipModifier -= 0.25; // -10%
    }
    // Location modifiers
    if (location === "Urban") {
      tipModifier += 0.05; // +5%
    }
    if (location === "Tourist Area") {
      tipModifier += 0.1; // +10%
    }
  
    // Fanciness modifiers
    if (fanciness === "Casual") {
      tipModifier -= 0.05; // -5%
    }
    if (fanciness === "Fancy") {
      tipModifier += 0.05; // +5%
    }
    
    // Time spent modifier
    const extraTime = Math.max(0, parseInt(timeSpent) - 60);
    if (extraTime > 0) {
      const timeBonus = Math.floor(extraTime / 10) * 0.02; // +2% per 10 minutes over an hour
      tipModifier += timeBonus;
    }
    
    // Apply all modifiers to get the modified tip
    let modifiedTip = baseTip * tipModifier;
    
    // Service quality (mood) adjustments
    if (selectedMood) {
      switch (selectedMood) {
        case 1: // Terrible
          modifiedTip = Math.min(1, billAmount); // max $1 tip
          break;
        case 2: // Bad
          modifiedTip *= 0.6; // 60% of calculated tip
          break;
        case 3: // Okay
          modifiedTip *= 0.8; // 80% of calculated tip
          break;
        case 4: // Good
          // Keep as is
          break;
        case 5: // Great
          modifiedTip *= 1.2; // 120% of calculated tip
          break;
        default:
          break;
      }
    }
    
    // Special case for labor jobs
    if (selectedGenre === 4) {
      const minTip = 5;
      const maxTip = 100;
      
      if (modifiedTip < minTip) {
        modifiedTip = minTip;
      } else if (modifiedTip > maxTip) {
        modifiedTip = maxTip;
      }
    }
    
    return modifiedTip.toFixed(2);
  }, [billAmount, fanciness, location, selectedGenre, selectedMood, timeSpent]);

  // Traditional tip calculation as fallback
  const calculateTraditionalTip = useCallback(() => {
    let tipPercent = 20;
  
    // Genre modifiers
    if (selectedGenre === 2) tipPercent += 15;
    if (selectedGenre === 3) tipPercent -= 10; // Coffee
    if (selectedGenre === 4) tipPercent -= 10; // Labor
    if (selectedGenre === 5) tipPercent -= 15;
  
    // Location modifiers
    if (location === "Urban") tipPercent += 5;
    if (location === "Tourist Area") tipPercent += 10;
  
    // Time of day modifier
    if (timeOfDay === "morning") tipPercent -= 2;
  
    // Fanciness modifiers
    if (fanciness === "Casual") tipPercent -= 5;
    if (fanciness === "Fancy") tipPercent += 10;
  
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
  }, [billAmount, fanciness, location, selectedGenre, selectedMood, timeOfDay, timeSpent]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsCalculating(true);
  
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
    setMlError(null);
  
    try {
      let finalTip;
      
      // First get the ML base prediction
      const mlBaseTip = getMLBaseTip();
      
      if (mlBaseTip !== null) {
        // If ML prediction succeeded, apply modifiers
        finalTip = applyModifiers(mlBaseTip);
      } else {
        // Fallback to traditional calculation if ML fails
        finalTip = calculateTraditionalTip();
      }
      
      setSuggestedTip(finalTip);
    } catch (error) {
      console.error("Error calculating tip:", error);
      setMlError("An error occurred while calculating the tip.");
    } finally {
      setIsCalculating(false);
    }
  }, [applyModifiers, billAmount, calculateTraditionalTip, day, fanciness, getMLBaseTip, location, partySize, selectedGenre, selectedMood, timeOfDay, timeSpent]);

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
            disabled={isCalculating}
          />
        </div>

        {/* Location */}
        <div>
          <label>Location: </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={isCalculating}
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
            disabled={isCalculating}
          >
            <option value="">-- Please select --</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        {/* Day of Week */}
        <div>
          <label>Day of the Week: </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
            disabled={isCalculating}
          >
            <option value="">-- Select Day --</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day.toLowerCase()}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Party Size */}
        <div>
          <label>Party Size: </label>
          <input
            type="number"
            min="1"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            required
            disabled={isCalculating}
          />
        </div>

        {/* Fanciness */}
        <div>
          <label>Fanciness Level: </label>
          <select
            value={fanciness}
            onChange={(e) => setFanciness(e.target.value)}
            required
            disabled={isCalculating}
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
                disabled={isCalculating}
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
        className={`mood-button ${selectedGenre === item.level ? "selected" : ""} ${item.level === 1 ? "Fast-Food-button" : ""}`}
        onClick={() => setSelectedGenre(item.level)}
        title={item.label}
        disabled={isCalculating}
      >
        <img
          src={item.image}
          alt={item.label}
          className="mood-img"
        />
        <p className="label">{item.label}</p>
        {item.sublabel && <p className="sublabel">{item.sublabel}</p>}
      </button>
    ))}
  </div>
  {selectedGenre && (
  <p>
    You selected: {genre[selectedGenre - 1].label}
    {genre[selectedGenre - 1].sublabel && ` (${genre[selectedGenre - 1].sublabel})`}
  </p>
)}

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
            disabled={isCalculating}
          />
        </div>

        {/* Submit and Reset Buttons */}
        <div style={{ marginTop: "20px" }} className="form-buttons">
          <button type="submit" disabled={isCalculating}>
            {isCalculating ? "Calculating..." : "Calculate Tip!"}
          </button>
          
          {suggestedTip && (
            <button type="button" onClick={resetForm} disabled={isCalculating}>
              Reset Form
            </button>
          )}
          
          {suggestedTip && (
            <button type="button" onClick={() => setSuggestedTip(null)} disabled={isCalculating}>
              Edit Values
            </button>
          )}
        </div>
      </form>
      
      {suggestedTip && (
        <div className="tip-result">
          <h3>Suggested Tip Amount: ${suggestedTip}</h3>
        </div>
      )}
    </div>
  );
};

export default UserFormPage;