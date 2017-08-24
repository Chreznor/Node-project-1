const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //Every single time there is a request it's gonna ask passport what should be done with the user in order to confirm that they are properly logged in
