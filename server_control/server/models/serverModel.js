const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  iloIp: { type: String, required: true },
  networkIp: { type: String, required: true },
});

module.exports = mongoose.model('Server', serverSchema);
