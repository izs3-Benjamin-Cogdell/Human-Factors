const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const TipSchema = new mongoose.Schema({
  isSplit: {
    type: Boolean,
    default: false
  },
  splitType: {
    type: String,
    enum: ['equal', 'custom', null],
    default: null
  },
  splitCount: {
    type: Number,
    min: 2,
    max: 10,
    default: null
  },
  splitDetails: [{
    personId: Number,
    percentage: Number,
    amount: Number,
    tipAmount: Number,
    totalAmount: Number
  }]
});
module.exports = mongoose.model("User", userSchema, "users");
