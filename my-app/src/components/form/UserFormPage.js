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

const UserFormPage = () => {
  const [billAmount, setBillAmount] = useState("");
  const [location, setLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [fanciness, setFanciness] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [suggestedTip, setSuggestedTip] = useState(null);
  const [timeSpent, setTimeSpent] = useState("");

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
    };
  
    console.log("Form Submitted:", formData);
  
    // 👉 Temporary dummy logic: 20% tip
    const calculatedTip = billAmount ? (parseFloat(billAmount) * 0.2).toFixed(2) : "0.00";
    setSuggestedTip(calculatedTip);
  };
  

  return (
    <div className="user-form-page">
      <h2>Suggested Tip Calculator</h2>
      <form onSubmit={handleSubmit}>
        {/* Bill Amount */}
        <div>
          <label>Bill Amount ($): </label>
          <input
            type="number"
            min="0"
            step="1.0"
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
  <label>What type of service or business was it?</label>
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

        {/* Submit */}
        <div style={{ marginTop: "20px" }}>
          <button type="submit">Calculate Tip!</button>
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
