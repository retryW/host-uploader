// grab the things we need
var mongoose = require('mongoose');
mongoose.connect('mongodb://redacted');
var Schema = mongoose.Schema;

// create a schema
var banSchema = new Schema({
    hostname: { type: String, required: true },
    banNumber: { type: Number, required: true },
    created_at: { type: Date, required: false },
    updated_at: { type: Date, required: false}
});

// on every save, add the date
banSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

// Create a model from the schema
var Ban = mongoose.model('Ban', banSchema, 'bans');

module.exports = Ban;
