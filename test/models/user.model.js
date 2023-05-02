const mongoose = require('mongoose');

var userSchema = new mongoose.Schema ({
    pseudo : String
});

mongoose.model('users', userSchema);