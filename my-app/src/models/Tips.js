// MongoDB Schema (models/Tip.js)
const mongoose = require('mongoose');

const TipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  billAmount: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true,
    enum: ['Urban', 'Suburban', 'Rural', 'Tourist Area']
  },
  timeOfDay: {
    type: String,
    required: true,
    enum: ['morning', 'evening']
  },
  fanciness: {
    type: String,
    required: true,
    enum: ['Casual', 'Moderate', 'Fancy']
  },
  serviceQuality: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  genre: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  timeSpent: {
    type: Number,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1
  },
  suggestedTip: {
    type: Number,
    required: true
  },
  actualTipAmount: {
    type: Number,
    required: true
  },
  tipPercentage: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Tip', TipSchema);

// Backend Routes (routes/tips.js)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tip = require('../models/Tip');

// @route   POST api/tips
// @desc    Create a new tip record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      billAmount,
      location,
      timeOfDay,
      fanciness,
      serviceQuality,
      genre,
      timeSpent,
      day,
      partySize,
      suggestedTip,
      actualTipAmount,
      tipPercentage
    } = req.body;

    // Create a new tip object
    const newTip = new Tip({
      user: req.user.id,
      billAmount,
      location,
      timeOfDay,
      fanciness,
      serviceQuality,
      genre,
      timeSpent,
      day,
      partySize,
      suggestedTip,
      actualTipAmount,
      tipPercentage
    });

    const tip = await newTip.save();
    res.json(tip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tips/user/:userId
// @desc    Get all tips for a specific user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Make sure the requesting user can only access their own tips
    if (req.params.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to access this data' });
    }

    const tips = await Tip.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(tips);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tips/stats/:userId
// @desc    Get tip statistics for a user
// @access  Private
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    // Make sure the requesting user can only access their own stats
    if (req.params.userId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to access this data' });
    }

    const tips = await Tip.find({ user: req.params.userId });
    
    // Calculate average tip percentage
    let avgTipPercentage = 0;
    if (tips.length > 0) {
      const totalPercentage = tips.reduce((sum, tip) => {
        return sum + (tip.actualTipAmount / tip.billAmount) * 100;
      }, 0);
      avgTipPercentage = totalPercentage / tips.length;
    }
    
    // Calculate other stats as needed
    const stats = {
      totalTips: tips.length,
      avgTipPercentage: avgTipPercentage.toFixed(1),
      totalSpent: tips.reduce((sum, tip) => sum + tip.billAmount, 0).toFixed(2),
      totalTipped: tips.reduce((sum, tip) => sum + tip.actualTipAmount, 0).toFixed(2)
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tips/:id
// @desc    Delete a tip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    
    if (!tip) {
      return res.status(404).json({ msg: 'Tip not found' });
    }
    
    // Make sure user owns the tip
    if (tip.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await tip.remove();
    res.json({ msg: 'Tip removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;