const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const schema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		minlength: 5
	},
	phone: {
		type: String,
		minlength: 5
	},
	street: {
		type: String,
		required: true,
		minlength: 5
	},
	city: {
		type: String,
		required: true,
		minlength: 3
	},
})

module.exports = mongoose.model('Person', schema);