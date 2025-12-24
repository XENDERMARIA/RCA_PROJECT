const mongoose = require('mongoose');

const rcaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Server', 'Database', 'Network', 'App', 'Security', 'Other']
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
    trim: true
  },
  rootCause: {
    type: String,
    required: [true, 'Root cause is required'],
    trim: true
  },
  solution: {
    type: String,
    required: [true, 'Solution is required'],
    trim: true
  },
  prevention: {
    type: String,
    trim: true,
    default: ''
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Resolved'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: String,
    default: 'Anonymous'
  }
}, {
  timestamps: true
});

// Create text index for search functionality
rcaSchema.index({ 
  title: 'text', 
  symptoms: 'text', 
  rootCause: 'text', 
  solution: 'text',
  tags: 'text'
});

// Virtual for formatted date
rcaSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Ensure virtuals are included in JSON output
rcaSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('RCA', rcaSchema);
