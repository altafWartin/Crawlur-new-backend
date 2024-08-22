const mongoose = require('mongoose');
const { Schema } = mongoose;

const amazonProductSchema = new Schema({}, { strict: false });

const AmazonProduct = mongoose.model('AmazonProduct', amazonProductSchema);

module.exports = AmazonProduct;
