const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  boost: { type: Number, required: true },
});

module.exports = mongoose.model('Item', itsemSchema);