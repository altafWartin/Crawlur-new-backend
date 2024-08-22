const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  amazonProductId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  images: [String],
  mainImage: { type: String },
  link: { type: String },
  brand: { type: String },
  categories: [{
    name: { type: String },
    link: { type: String },
    categoryId: { type: String }
  }],
  videos: [String],
  color: { type: String },
  model_number: { type: String },
  price: { type: String },
  imagesCount: { type: Number },
  videosCount: { type: Number },
  imagesFlat: { type: String },
  videosFlat: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
