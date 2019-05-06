// grab the things we need
var mongoose = require('mongoose');
mongoose.connect('mongodb://redacted');
var Schema = mongoose.Schema;

// create a schema
var uploadSchema = new Schema({
	hostname: { type: String, required: true },
	result: { type: String, required: true },
	output: { type: String, required: false },
	created_at: { type: Date, required: false }
});

// on every save, add the date
uploadSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
    this.created_at = currentDate;
  next();
});

// Create a model from the schema
var Upload = mongoose.model('Upload', uploadSchema, 'uploads');

module.exports = Upload;