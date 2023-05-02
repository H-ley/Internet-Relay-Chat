require('../config/db');
require('../models/user.model'); 
const mongoose = require('mongoose');
var User = mongoose.model('users');

function check_add_user(users)  {
    return new Promise((resolve, reject) => {
        User.findOne({pseudo : users}, (err, user) => {
            if (user) {
                resolve("User already exists");
            } else {
                add_user(users);
                resolve("User added successfully");
            }
        });
    })
};

function add_user (users) {
    var user = new User();
    user.pseudo = users;
    user.save();
};

function check_rename(users, new_pseudo)  {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({pseudo : users}, {pseudo : new_pseudo}, (err, user) => {
            if (err || users === new_pseudo) {
                resolve("Pseudo already exists")
            } else {
                resolve("Modified successfully");
            }
        })
    })
};

module.exports.find_user = (req, res) => {
    User.findOne({pseudo : req.body.pseudo}, (err, user) => {
        if (user) {
            return(res.status(200).send({id : user.id}));
        } else {
            return(res.status(503).send("Username doesn't exist"));
        }
    });
};

module.exports.find_all_user = (req, res) => {
    User.find({}, (err, user) => {
        if (user) {
            return(res.status(200).send(user));
        } else {
            return(res.status(503).send("Username doesn't exist"));
        }
    });
};

module.exports = {check_add_user, add_user, check_rename}