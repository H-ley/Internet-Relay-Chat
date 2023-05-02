require('../config/db');
require('../models/chanel.model'); 
require('../models/user.model'); 
const mongoose = require('mongoose');
var Chanel = mongoose.model('chanels');
var User = mongoose.model('users');
var Msg = mongoose.model('message');

// Création d'un chanel + check de sa présnece
function create_chanel (chanelName) {
    return new Promise(function(resolve, reject) {
        Chanel.findOne({name : chanelName}, (err, chan) => {
            if (chan) {
                resolve("Chanel already exist");
            } else {
                resole(this.add_chanel(chanelName));
            }
        })
    });
};

function add_chanel(chanelName) {
    return new Promise(function(resolve, reject) {
        Chanel.create({name: chanelName}, (err, chanel) => {
            if (err) {
                resolve("Chanel already exists !");
            }
            resolve("Chanel created");
        })
    });
    
};

// liste de tous chanel
function list_chanel() {
    return new Promise(function(resolve) {
        Chanel.find({}, (err, obj) => {
            resolve(obj);
        })
    })
};

// return un chanel précis
function find_chanel(chanelName) {
    return new Promise(function(resolve, reject) {
        Chanel.find({name: chanelName}, (err, obj) => {
            if (err) {
                resolve("Chanel don't exist");
            }
            resolve(obj);
        })
    });
};

// route: /delete_chanel
function delete_chanel(chanel) {
    return new Promise((resolve) => {
        Chanel.deleteOne({name : chanel}, (err, result) => {
            if (!result) {
                resolve("Chanel not found or does not exist");
            } else {
                resolve("Chanel deleted");
            }
        })
    });
}


// route: /add_user_chanel
function add_user_chanel (chanelName, users)  {
    return new Promise((resolve, reject) => {
        Chanel.findOne({name : chanelName}, (err, chanel) => {
            for(var [key, value] of  Object.entries(chanel.user)) {
                if (value == users) {
                    console.log("User exists", users);
                    return resolve("User already exists in this channel !");
                }
            }
            Chanel.findOneAndUpdate({name : chanelName},{$push: {user: users}}, (err, chanel) => {
                if (err) {
                    return resolve("Problem in the update of the bdd");
                } else {
                    return resolve("Update of " + users + " done");
                }
            })
        });
    });
};

// route: /list_user_in_chanel
function list_user_chanel(chanelName) {
    return new Promise(function(resolve) {
        Chanel.findOne({name : chanelName}, (err, users) => {
            if(err) {
                return resolve("Chanel not found");
            } else {
                return resolve(users.user);
            }
        });
    });
};

// route: /delete_user_chanel
function delete_user_chanel (chanelName, user) {
    return new Promise((resolve) => {
        Chanel.findOneAndUpdate({name : chanelName},{$pull: {user: user}}, (err, chanel) => {
            if (err) {
                console.log(err);
                return resolve("Problem in the update of the bdd");
            } else {
                return resolve("Update of " + user + " done");
            }
        })
    });
}


// route: /add_message 
function add_message(chanel, user, mess) {
    return new Promise((resolve) => {
        var msg = new Msg();
        msg.pseudo = user;
        msg.message = mess;
        Chanel.findOneAndUpdate({name : chanel}, {$push: {message: msg}}, (err, chanel) => {
            if (err) {
                return resolve(err);
            } else {
                return resolve("New message saved");
            }
        });
    })
}


// route: /list_message/:chanel
function list_message (chanel) {
    return new Promise((resolve) => {
        Chanel.findOne({name: chanel}, (err, chanel) => {
            if (err) {
                return resolve(err);
            } else {
                return resolve(chanel.message);
            }
        })
    })
}

module.exports = {add_user_chanel, create_chanel, add_chanel, find_chanel, list_chanel, delete_chanel, delete_user_chanel, list_user_chanel, add_message, list_message}