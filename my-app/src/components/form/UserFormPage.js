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
  
  // Bill splitting state variables - properly moved inside component
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [splitType, setSplitType] = useState("equal"); // "equal" or "custom"
  const [customSplits, setCustomSplits] = useState([
    { id: 1, amount: 0, percentage: 50 },
    { id: 2, amount: 0, percentage: 50 }
  ]);
  const [selectedSplitEntry, setSelectedSplitEntry] = useState(null);
  
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

  // Reset split options when resetting the form
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
    
    // Reset split options
    setShowSplitOptions(false);
    setSplitCount(2);
    setSplitType("equal");
    setCustomSplits([
      { id: 1, amount: 0, percentage: 50 },
      { id: 2, amount: 0, percentage: 50 }
    ]);
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

  // Function to open split details modal from history
  const openSplitDetails = (entry) => {
    setSelectedSplitEntry(entry);
  };

  // Add split person function
  const addSplitPerson = () => {
    if (splitCount < 10) { // Limit to 10 people for UI reasons
      const newSplitCount = splitCount + 1;
      setSplitCount(newSplitCount);
      
      // Update custom splits
      if (splitType === "custom") {
        // Calculate even percentage distribution
        const evenPercentage = 100 / newSplitCount;
        
        // Update all percentages to be even
        const updatedSplits = customSplits.map(split => ({
          ...split,
          percentage: evenPercentage
        }));
        
        // Add new person
        updatedSplits.push({
          id: newSplitCount,
          amount: 0,
          percentage: evenPercentage
        });
        
        setCustomSplits(updatedSplits);
      }
    }
  };

  // Remove split person function
  const removeSplitPerson = () => {
    if (splitCount > 2) { // Minimum 2 people for splitting
      const newSplitCount = splitCount - 1;
      setSplitCount(newSplitCount);
      
      // Update custom splits
      if (splitType === "custom") {
        // Remove last person
        const updatedSplits = customSplits.slice(0, -1);
        
        // Calculate even percentage distribution
        const evenPercentage = 100 / newSplitCount;
        
        // Update all percentages to be even
        setCustomSplits(updatedSplits.map(split => ({
          ...split,
          percentage: evenPercentage
        })));
      }
    }
  };

  // Handle custom split percentage changes
  const handleCustomSplitChange = (id, newPercentage) => {
    // Validate percentage
    newPercentage = Math.max(0, Math.min(100, newPercentage));
    
    // Update percentage for selected person
    const updatedSplits = customSplits.map(split => {
      if (split.id === id) {
        return { ...split, percentage: newPercentage };
      }
      return split;
    });
    
    // Calculate amount for each person based on bill and percentage
    const billValue = parseFloat(billAmount) || 0;
    const updatedSplitsWithAmounts = updatedSplits.map(split => ({
      ...split,
      amount: (billValue * (split.percentage / 100)).toFixed(2)
    }));
    
    setCustomSplits(updatedSplitsWithAmounts);
  };

  // Function to calculate even splits
  const calculateEvenSplits = () => {
    const billValue = parseFloat(billAmount) || 0;
    const tipValue = parseFloat(actualTipAmount || suggestedTip) || 0;
    const totalValue = billValue + tipValue;
    
    const perPersonAmount = (billValue / splitCount).toFixed(2);
    const perPersonTip = (tipValue / splitCount).toFixed(2);
    const perPersonTotal = (totalValue / splitCount).toFixed(2);
    
    return {
      perPersonAmount,
      perPersonTip,
      perPersonTotal
    };
  };

  // Function to calculate custom splits
  const calculateCustomSplits = () => {
    const billValue = parseFloat(billAmount) || 0;
    const tipValue = parseFloat(actualTipAmount || suggestedTip) || 0;
    
    return customSplits.map(split => {
      const splitPercentage = split.percentage / 100;
      const splitAmount = (billValue * splitPercentage).toFixed(2);
      const splitTip = (tipValue * splitPercentage).toFixed(2);
      const splitTotal = (parseFloat(splitAmount) + parseFloat(splitTip)).toFixed(2);
      
      return {
        id: split.id,
        percentage: split.percentage,
        amount: splitAmount,
        tip: splitTip,
        total: splitTotal
      };
    });
  };

  // Helper function to create equal split details
  const createEqualSplitDetails = () => {
    const billValue = parseFloat(billAmount);
    const tipValue = parseFloat(actualTipAmount);
    const perPersonBill = billValue / splitCount;
    const perPersonTip = tipValue / splitCount;
    
    return Array.from({ length: splitCount }, (_, i) => ({
      personId: i + 1,
      percentage: 100 / splitCount,
      amount: perPersonBill.toFixed(2),
      tipAmount: perPersonTip.toFixed(2),
      totalAmount: (perPersonBill + perPersonTip).toFixed(2)
    }));
  };

  // Helper function to create custom split details
  const createCustomSplitDetails = () => {
    const billValue = parseFloat(billAmount);
    const tipValue = parseFloat(actualTipAmount);
    
    return customSplits.map(split => {
      const percentage = split.percentage;
      const amount = (billValue * (percentage / 100));
      const tipAmount = (tipValue * (percentage / 100));
      
      return {
        personId: split.id,
        percentage,
        amount: amount.toFixed(2),
        tipAmount: tipAmount.toFixed(2),
        totalAmount: (amount + tipAmount).toFixed(2)
      };
    });
  };

  // Updated saveToHistory function with split information
  const saveToHistory = () => {
    if (!actualTipAmount || !billAmount) {
      alert("Please enter the actual tip amount you gave");
      return;
    }
    
    // Prepare split information if it exists
    let splitInfo = null;
    
    if (showSplitOptions) {
      splitInfo = {
        isSplit: true,
        splitType: splitType,
        splitCount: splitCount,
        splitDetails: splitType === "equal" 
          ? createEqualSplitDetails()
          : createCustomSplitDetails()
      };
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
      tipPercentage: ((parseFloat(actualTipAmount) / parseFloat(billAmount)) * 100).toFixed(1),
      
      // Add split information if present
      ...(splitInfo && {
        isSplit: splitInfo.isSplit,
        splitType: splitInfo.splitType,
        splitCount: splitInfo.splitCount,
        splitDetails: splitInfo.splitDetails
      })
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
      
      {/* History Section - Updated with Split Information */}
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
                <th>Split</th>
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
                  <td>
                    {entry.isSplit ? (
                      <button 
                        className="view-split-btn"
                        onClick={() => openSplitDetails(entry)}
                      >
                        View {entry.splitType === 'equal' ? 'Equal' : 'Custom'} Split
                      </button>
                    ) : 'No'}
                  </td>
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
          </div>{/* Service Quality (Mood) */}
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
       {suggestedTip && !showHistory && (
        <div className="split-bill-section">
          <div className="split-bill-header">
            <h3>Split the Bill</h3>
            <button 
              type="button"
              onClick={() => setShowSplitOptions(!showSplitOptions)}
              className="toggle-split-btn"
            >
              {showSplitOptions ? "Hide Split Options" : "Show Split Options"}
            </button>
          </div>
          
          {showSplitOptions && (
            <div className="split-options">
              <div className="split-controls">
                <div className="split-type-selector">
                  <label>Split Type:</label>
                  <div className="split-type-buttons">
                    <button
                      type="button"
                      className={`split-type-btn ${splitType === "equal" ? "active" : ""}`}
                      onClick={() => setSplitType("equal")}
                    >
                      Split Equally
                    </button>
                    <button
                      type="button"
                      className={`split-type-btn ${splitType === "custom" ? "active" : ""}`}
                      onClick={() => setSplitType("custom")}
                    >
                      Custom Split
                    </button>
                  </div>
                </div>
                
                <div className="split-count-control">
                  <label>Number of People:</label>
                  <div className="split-count-adjuster">
                    <button 
                      type="button" 
                      onClick={removeSplitPerson}
                      disabled={splitCount <= 2}
                      className="split-btn"
                    >
                      -
                    </button>
                    <span className="split-count">{splitCount}</span>
                    <button 
                      type="button" 
                      onClick={addSplitPerson}
                      disabled={splitCount >= 10}
                      className="split-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              {splitType === "equal" ? (
                // Equal split UI
                <div className="equal-split-result">
                  <h4>Each Person Pays:</h4>
                  <div className="split-result-grid">
                    <div className="split-result-row header">
                      <div>Item</div>
                      <div>Per Person</div>
                      <div>Total</div>
                    </div>
                    <div className="split-result-row">
                      <div>Bill Amount</div>
                      <div>${(parseFloat(billAmount) / splitCount).toFixed(2)}</div>
                      <div>${parseFloat(billAmount).toFixed(2)}</div>
                    </div>
                    <div className="split-result-row">
                      <div>Tip</div>
                      <div>${(parseFloat(actualTipAmount || suggestedTip) / splitCount).toFixed(2)}</div>
                      <div>${parseFloat(actualTipAmount || suggestedTip).toFixed(2)}</div>
                    </div>
                    <div className="split-result-row total">
                      <div>Total</div>
                      <div>${((parseFloat(billAmount) + parseFloat(actualTipAmount || suggestedTip)) / splitCount).toFixed(2)}</div>
                      <div>${(parseFloat(billAmount) + parseFloat(actualTipAmount || suggestedTip)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Custom split UI
                <div className="custom-split-result">
                  <h4>Custom Split:</h4>
                  <p className="custom-split-note">Adjust percentages below to customize how the bill is split</p>
                  
                  <div className="custom-splits-container">
                    <div className="custom-split-row header">
                      <div>Person</div>
                      <div>Percentage</div>
                      <div>Bill Amount</div>
                      <div>Tip</div>
                      <div>Total</div>
                    </div>
                    
                    {calculateCustomSplits().map(split => (
                      <div className="custom-split-row" key={split.id}>
                        <div>Person {split.id}</div>
                        <div className="percentage-input">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={split.percentage}
                            onChange={(e) => handleCustomSplitChange(split.id, parseFloat(e.target.value))}
                          />
                          <span>%</span>
                        </div>
                        <div>${split.amount}</div>
                        <div>${split.tip}</div>
                        <div>${split.total}</div>
                      </div>
                    ))}
                    
                    <div className="custom-split-row total">
                      <div>Total</div>
                      <div>{customSplits.reduce((sum, split) => sum + split.percentage, 0).toFixed(1)}%</div>
                      <div>${parseFloat(billAmount).toFixed(2)}</div>
                      <div>${parseFloat(actualTipAmount || suggestedTip).toFixed(2)}</div>
                      <div>${(parseFloat(billAmount) + parseFloat(actualTipAmount || suggestedTip)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Split Details Modal */}
      {selectedSplitEntry && (
        <div className="split-details-modal">
          <div className="split-modal-content">
            <div className="split-modal-header">
              <h3>Bill Split Details</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedSplitEntry(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="split-modal-body">
              <div className="split-info-summary">
                <p>
                  <strong>Date:</strong> {new Date(selectedSplitEntry.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Split Type:</strong> {selectedSplitEntry.splitType === 'equal' ? 'Equal' : 'Custom'}
                </p>
                <p>
                  <strong>Number of People:</strong> {selectedSplitEntry.splitCount}
                </p>
                <p>
                  <strong>Total Bill:</strong> ${selectedSplitEntry.billAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Total Tip:</strong> ${selectedSplitEntry.actualTipAmount.toFixed(2)}
                </p>
              </div>
              
              <table className="split-details-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Percentage</th>
                    <th>Bill Amount</th>
                    <th>Tip Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSplitEntry.splitDetails.map(detail => (
                    <tr key={detail.personId}>
                      <td>Person {detail.personId}</td>
                      <td>{detail.percentage.toFixed(1)}%</td>
                      <td>${parseFloat(detail.amount).toFixed(2)}</td>
                      <td>${parseFloat(detail.tipAmount).toFixed(2)}</td>
                      <td>${parseFloat(detail.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFormPage;