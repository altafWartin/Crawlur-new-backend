const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for AmazonProduct
const amazonProductSchema = new Schema({
  product: {
    type: Schema.Types.Mixed, // This will allow for flexible, nested data structures
    required: true
  },
  status: {
    type: String,
    enum: ['Approve', 'Edit', 'Fix', 'Draft', 'Duplicate', 'Delete'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  userFeedback: {
    thumbsUp: {
      type: Number,
      default: 0
    },
    thumbsDown: {
      type: Number,
      default: 0
    },
    feedbackComments: [{
      type: String
    }]
  }
}, { timestamps: true });

// Create the model
const AmazonProduct = mongoose.model('AmazonProduct', amazonProductSchema);

module.exports = AmazonProduct;
