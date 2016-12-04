var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var stockSchema = new Schema({
  name: String,
  symbol: String
});



var Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
