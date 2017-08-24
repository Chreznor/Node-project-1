const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator'); //a great validation package for nodeJS
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose'); // is a middleware for nodejs. it can be used with any NodeJs framework that has built-in middleware. It essentially takes away a lot of the heavy lifting that comes along with managing sessions, creating tokens, log people in and out.

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, 'Invalid Email Address'],
		required: 'Please Supply an email address'
	},
	name: {
		type: String,
		required: 'Please supply a name',
		trim: true
	}
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);