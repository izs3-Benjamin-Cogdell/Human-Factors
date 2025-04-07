import modelData from './tip_model_coefficients.json';

const tipPredictionModel = {
  // Use the values from the JSON file
  intercept: modelData.intercept,
  coefficients: modelData.coefficients,
  
  // Function to predict tip based on input values
  predict: function(inputs) {
    // Start with the intercept
    let prediction = this.intercept;
    
    // Add contribution from each feature
    prediction += inputs.total_bill * this.coefficients.total_bill;
    prediction += inputs.time * this.coefficients.time;
    prediction += inputs.size * this.coefficients.size;
    
    // Add day contributions
    // For the selected day, its value is 1, others are 0
    if (inputs.day === 'Fri') prediction += this.coefficients.day_Fri;
    if (inputs.day === 'Sat') prediction += this.coefficients.day_Sat;
    if (inputs.day === 'Sun') prediction += this.coefficients.day_Sun;
    if (inputs.day === 'Thur') prediction += this.coefficients.day_Thur;
    
    // Ensure prediction is not negative
    return Math.max(0, prediction);
  }
};

export default tipPredictionModel;