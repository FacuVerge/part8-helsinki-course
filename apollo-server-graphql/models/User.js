const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const schema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 3
	},
	friends: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Person'
		}
	],
	favoriteGenre: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model('User', schema);