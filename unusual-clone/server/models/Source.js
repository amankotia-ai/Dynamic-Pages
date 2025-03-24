const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplacementSchema = new Schema({
  selector: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  }
});

const SourceSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rule_type: {
    type: String,
    required: true,
    enum: ['referrer_contains', 'url_param_equals'],
    default: 'referrer_contains'
  },
  rule_value: {
    type: String,
    required: true,
    trim: true
  },
  param_name: {
    type: String,
    trim: true,
    default: ''
  },
  param_value: {
    type: String,
    trim: true,
    default: ''
  },
  replacements: [ReplacementSchema],
  priority: {
    type: Number,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Source', SourceSchema); 