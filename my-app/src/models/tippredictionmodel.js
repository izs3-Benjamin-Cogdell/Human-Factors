// Import the model coefficients from the JSON file
// If you haven't created this file yet, replace with hardcoded values temporarily
// import modelData from './tip_model_coefficients.json';

// Temporary hardcoded values - replace these with your actual model coefficients
// when you export them from your Python model
const modelData = {
    intercept: 0.920,
    coefficients: {
      total_bill: 0.105,    // Coefficient for total bill amount
      time: 0.207,          // Coefficient for time (0=Lunch, 1=Dinner)
      size: 0.137,          // Coefficient for party size
      day_Fri: 0.127,       // Coefficient for Friday
      day_Sat: 0.218,       // Coefficient for Saturday
      day_Sun: 0.152,       // Coefficient for Sunday
      day_Thur: 0.0         // Base day (coefficient is 0)
    }
  };
  
  const tipPredictionModel = {
    // Use the values from the JSON file or hardcoded values
    intercept: modelData.intercept,
    coefficients: modelData.coefficients,
    
    // Function to predict tip based on input values
    predict: function(inputs) {
      console.log("Predicting tip with inputs:", inputs);
      
      // Start with the intercept
      let prediction = this.intercept;
      
      // Add contribution from each feature
      prediction += inputs.total_bill * this.coefficients.total_bill;
      prediction += inputs.time * this.coefficients.time;
      prediction += inputs.size * this.coefficients.size;
      
      // Add day contributions
      // Map the day of week to the appropriate coefficient
      // Your model likely used one-hot encoding with Thur as the reference
      const dayMap = {
        'Friday': this.coefficients.day_Fri,
        'Saturday': this.coefficients.day_Sat,
        'Sunday': this.coefficients.day_Sun,
        'Thursday': this.coefficients.day_Thur
      };
      
      // Get the coefficient for the day, defaulting to 0 if not found
      const dayCoef = dayMap[inputs.day] || 0;
      prediction += dayCoef;
      
      console.log("Model calculation steps:");
      console.log(`- Starting with intercept: ${this.intercept}`);
      console.log(`- Total bill contribution: ${inputs.total_bill} * ${this.coefficients.total_bill} = ${inputs.total_bill * this.coefficients.total_bill}`);
      console.log(`- Time contribution: ${inputs.time} * ${this.coefficients.time} = ${inputs.time * this.coefficients.time}`);
      console.log(`- Size contribution: ${inputs.size} * ${this.coefficients.size} = ${inputs.size * this.coefficients.size}`);
      console.log(`- Day contribution for ${inputs.day}: ${dayCoef}`);
      console.log(`- Final prediction: ${prediction}`);
      
      // Ensure prediction is not negative
      return Math.max(0, prediction);
    }
  };
  
  export default tipPredictionModel;