import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  // Navigation function to return to homepage
  const navigateToHome = () => {
    navigate('/');
  };

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
  
  // New state variables for history tracking
  const [tipHistory, setTipHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [averageTip, setAverageTip] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMessage, setComparisonMessage] = useState("");
  const [actualTipAmount, setActualTipAmount] = useState("");
  const [userId, setUserId] = useState(null);
  
  // Load tip history from localStorage and check for user authentication
  useEffect(() => {
    // Get user ID from localStorage (set during login)
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
      setUserId(storedUserId);
      
      // Fetch tip history from localStorage for now
      const savedTipHistory = localStorage.getItem('tipHistory');
      if (savedTipHistory) {
        const parsedHistory = JSON.parse(savedTipHistory);
        setTipHistory(parsedHistory);
        
        // Calculate average tip percentage
        if (parsedHistory.length > 0) {
          const totalPercentage = parsedHistory.reduce((sum, entry) => {
            return sum + (entry.actualTipAmount / entry.billAmount) * 100;
          }, 0);
          
          setAverageTip((totalPercentage / parsedHistory.length).toFixed(1));
        }
      }
      
      // You would normally fetch tip history from your MongoDB here
      // fetchTipHistoryFromDatabase(storedUserId);
    }
  }, []);

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
    setActualTipAmount("");
    setShowComparison(false);
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

  // Save the tip transaction to history
  const saveToHistory = () => {
    if (!actualTipAmount || !billAmount) {
      alert("Please enter the actual tip amount you gave");
      return;
    }
    
    const tipEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      billAmount: parseFloat(billAmount),
      location,
      timeOfDay,
      fanciness,
      serviceQuality: selectedMood,
      genre: selectedGenre,
      timeSpent: parseInt(timeSpent) || 0,
      day,
      partySize: parseInt(partySize),
      suggestedTip: parseFloat(suggestedTip),
      actualTipAmount: parseFloat(actualTipAmount),
      tipPercentage: ((parseFloat(actualTipAmount) / parseFloat(billAmount)) * 100).toFixed(1)
    };
    
    const newHistory = [tipEntry, ...tipHistory];
    setTipHistory(newHistory);
    
    // Save to localStorage as temporary storage
    localStorage.setItem('tipHistory', JSON.stringify(newHistory));
    
    // If user is logged in, save to MongoDB
    if (userId) {
      saveTipToDatabase(tipEntry);
    }
    
    // Calculate new average tip
    const totalPercentage = newHistory.reduce((sum, entry) => {
      return sum + (entry.actualTipAmount / entry.billAmount) * 100;
    }, 0);
    
    const newAverage = (totalPercentage / newHistory.length).toFixed(1);
    setAverageTip(newAverage);
    
    // Compare with suggested tip
    const tipDiff = parseFloat(actualTipAmount) - parseFloat(suggestedTip);
    let message = "";
    
    if (Math.abs(tipDiff) < 0.5) {
      message = "You tipped very close to the suggested amount.";
    } else if (tipDiff > 0) {
      message = `You tipped $${tipDiff.toFixed(2)} more than suggested. Was there a specific reason?`;
    } else {
      message = `You tipped $${Math.abs(tipDiff).toFixed(2)} less than suggested. Was there a specific reason?`;
    }
    
    setComparisonMessage(message);
    setShowComparison(true);
    
    // Reset form after a short delay to show the comparison
    setTimeout(() => {
      resetForm();
      setShowHistory(true);
    }, 5000);
  };
  
  // Function to save tip to MongoDB database
  const saveTipToDatabase = async (tipEntry) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No authentication token found. User may not be logged in.");
        return;
      }
      
      // Make an API call to your backend
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tipEntry)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save tip to database');
      }
      
      console.log('Tip saved to database successfully');
    } catch (error) {
      console.error('Error saving tip to database:', error);
      // You could set an error state here to show to the user
    }
  };
  
  // Function to fetch tip history from database
  const fetchTipHistoryFromDatabase = async (userId) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No authentication token found. User may not be logged in.");
        return;
      }
      
      // Make an API call to your backend
      const response = await fetch(`/api/tips/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tip history');
      }
      
      const data = await response.json();
      
      // Update the state with the fetched tip history
      setTipHistory(data);
      
      // Calculate average tip percentage
      if (data.length > 0) {
        const totalPercentage = data.reduce((sum, entry) => {
          return sum + (entry.actualTipAmount / entry.billAmount) * 100;
        }, 0);
        
        setAverageTip((totalPercentage / data.length).toFixed(1));
      }
      
      console.log('Tip history fetched successfully');
    } catch (error) {
      console.error('Error fetching tip history:', error);
      // You could set an error state here to show to the user
    }
  };
  
  // Function to get genre label by level
  const getGenreLabel = (level) => {
    const genreItem = genre.find(item => item.level === level);
    return genreItem ? genreItem.label : 'Unknown';
  };
  
  // Function to get mood label by level
  const getMoodLabel = (level) => {
    const moodItem = moods.find(item => item.level === level);
    return moodItem ? moodItem.label : 'Unknown';
  };

  return (
    <div className="user-form-page">
      <div className="home-button-container">
        <button 
          onClick={navigateToHome} 
          className="home-button"
        >
          Return to Homepage
        </button>
      </div>
      <h2>Suggested Tip Calculator</h2>
      
      {/* Toggle button for showing history */}
      <div className="history-controls">
        <button 
          type="button" 
          onClick={() => setShowHistory(!showHistory)}
          className="history-toggle-btn"
        >
          {showHistory ? "Hide History" : `View Tip History (${tipHistory.length})`}
        </button>
        
        {tipHistory.length > 0 && !showHistory && (
          <div className="quick-stats">
            <p>Your average tip: {averageTip}%</p>
          </div>
        )}
      </div>
      
      {/* History Section */}
      {showHistory && tipHistory.length > 0 && (
        <div className="tip-history">
          <h3>Your Tipping History</h3>
          <p className="history-summary">
            You've recorded {tipHistory.length} tips with an average of {averageTip}% of the bill.
          </p>
          
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill</th>
                <th>Tip</th>
                <th>%</th>
                <th>Type</th>
                <th>Service</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {tipHistory.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.billAmount.toFixed(2)}</td>
                  <td>${entry.actualTipAmount.toFixed(2)}</td>
                  <td>{entry.tipPercentage}%</td>
                  <td>{getGenreLabel(entry.genre)}</td>
                  <td>{getMoodLabel(entry.serviceQuality)}</td>
                  <td>{entry.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            type="button" 
            onClick={() => setShowHistory(false)}
            className="close-history-btn"
          >
            Close History
          </button>
        </div>
      )}
      
      {/* Error message */}
      {mlError && <p className="ml-error">{mlError}</p>}
      
      {/* Main form */}
      {!showHistory && (
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
              disabled={isCalculating || suggestedTip !== null}
            />
          </div>

          {/* Location */}
          <div>
            <label>Location: </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={isCalculating || suggestedTip !== null}
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
              disabled={isCalculating || suggestedTip !== null}
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
              disabled={isCalculating || suggestedTip !== null}
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
              disabled={isCalculating || suggestedTip !== null}
            />
          </div>

          {/* Fanciness */}
          <div>
            <label>Fanciness Level: </label>
            <select
              value={fanciness}
              onChange={(e) => setFanciness(e.target.value)}
              required
              disabled={isCalculating || suggestedTip !== null}
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
                  disabled={isCalculating || suggestedTip !== null}
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
                  disabled={isCalculating || suggestedTip !== null}
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
              disabled={isCalculating || suggestedTip !== null}
            />
          </div>

          {/* Submit and Reset Buttons */}
          <div style={{ marginTop: "20px" }} className="form-buttons">
            {!suggestedTip && (
              <button type="submit" disabled={isCalculating}>
                {isCalculating ? "Calculating..." : "Calculate Tip!"}
              </button>
            )}
            
            {suggestedTip && !showComparison && (
              <>
                <div className="actual-tip-input">
                  <label>What did you actually tip? $</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualTipAmount}
                    onChange={(e) => setActualTipAmount(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setActualTipAmount(suggestedTip)}
                    className="use-suggested-btn"
                  >
                    Use Suggested
                  </button>
                </div>
                
                <button 
                  type="button" 
                  onClick={saveToHistory}
                  disabled={!actualTipAmount}
                  className="save-btn"
                >
                  Save This Tip
                </button>
                
                <button type="button" onClick={() => setSuggestedTip(null)}>
                  Edit Values
                </button>
              </>
            )}
            
            <button type="button" onClick={resetForm} disabled={isCalculating}>
              Reset Form
            </button>
          </div>
        </form>
      )}
      
      {/* Tip Result */}
      {suggestedTip && !showHistory && (
        <div className="tip-result">
          <h3>Suggested Tip Amount: ${suggestedTip}</h3>
          <p>This is approximately {((parseFloat(suggestedTip) / parseFloat(billAmount)) * 100).toFixed(1)}% of your bill.</p>
          
          {tipHistory.length > 0 && (
            <p className="tip-comparison">
              Your average tip is {averageTip}% of the bill.
            </p>
          )}
          
          {showComparison && (
            <div className="comparison-feedback">
              <p>{comparisonMessage}</p>
              <div className="feedback-buttons">
                <button 
                  type="button" 
                  onClick={() => setShowComparison(false)}
                >
                  Service Quality
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowComparison(false)}
                >
                  Personal Preference
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowComparison(false)}
                >
                  Calculator Error
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowComparison(false)}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserFormPage;