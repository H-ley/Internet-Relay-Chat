const mongoose = require('mongoose');
require('../models/user.model');

var messageSchema = new mongoose.Schema({
    pseudo : String,
    message : String
});

var chanelSchema = new mongoose.Schema ({
    name : String,
    message : [messageSchema],
    user : [String]
});

mongoose.model('chanels', chanelSchema);
mongoose.model('message', messageSchema);
