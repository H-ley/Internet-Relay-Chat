const host = 'localhost';
const port = 3001;
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const db = require("./config/db");
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);

const User = require("./controllers/user.js");
const Chanel = require("./controllers/chanel.js");
const { response } = require("express");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // When a user is connected
    socket.on("create user", (user) => {
        var tmp = User.check_add_user(user);
        tmp.then((res) => {
            console.log("res = " + res);
            if (res !== "User added successfully") {
                console.log("User Already Exists :", user);
            }
        })
    });

    socket.on("join_room", (chanel, last_chanel, user) => {
        Chanel.find_chanel(chanel).then((res) => {
            if (res === "Chanel don't exist") {
                console.log("Chanel doesn't exist. Please do \"/list\" to see all chanel available ");
            } else {
                var tmp1 = Chanel.add_user_chanel(chanel, user).then((res2) => {
                    console.log("Joinning room...");
                    console.log("Room joined ...");
                    console.log(res2);
                    if (last_chanel !== "") {
                        socket.leave(last_chanel);
                    }
                    socket.emit('join_room', JSON.stringify(res))
                    socket.join(chanel)
                    Chanel.list_message(chanel).then((list_msg_of_the_chanel) => {
                        socket.emit("list msg", JSON.stringify(list_msg_of_the_chanel))
                    })
                });
            }
        });
    });

    socket.on("list", function (word) {
        var tmp = Chanel.list_chanel();
        tmp.then((chanels) => {
            var temp2 = ""
            for (var chanel of chanels) {
                if (word === "" || String(chanel.name).includes(word) == true) {
                    temp2 += ("Room:'" + chanel.name + "'\n")
                    console.log(chanel.name);
                }
            }
            socket.emit('messages', temp2)
        })
    });

    socket.on("send_message", (chanel, message) => {
        Chanel.add_message(chanel, message.author, message.message).then((res) => {
            if(res == "New message saved")
                socket.to(chanel).emit("receive_message", message);
        })
    });

    socket.on("rename", (pseudo, new_pseudo) => {
        var tmp = User.check_rename(pseudo, new_pseudo);
        tmp.then((res) => {
            if (res === "Modified successfully") {
                console.log("Modified successfully");
            } else {
                console.log("Pseudo '%s' already exists", new_pseudo);
            }
        })
        socket.username = new_pseudo;
    });

    socket.on("private message", ({ content, to }) => {
        socket.to(to).emit("private message", {
          content,
          from: socket.id,
        });
      });

    socket.on("delete room", (room) => {
        var tmp = Chanel.delete_chanel(room);
        tmp.then((res) => {
            if (res !== "Chanel deleted") {
                socket.emit("delete room", res);
            } else {
                socket.emit("delete room", "Chanel deleted");
                socket.leave(room);
            }
        });
    });

    socket.on("quit", (room, user) => {
        Chanel.delete_user_chanel(room, user).then(res => {
            if (res === "Problem in the update of the bdd") {
                console.log("The chanel or the user not found");
            } else {
                console.log('Someone leaves the %s room', room);
                socket.leave(room);
                socket.to(room).emit('User left', socket.id);
            }
        });
    });

    socket.on("create room", function (room) {
        var tmp = Chanel.add_chanel(room);
        tmp.then((res) => {
            if (res === "Chanel already exists !") {
                console.log("Chanel already exists !");
            } else {
                console.log("Chanel '%s' created", room);
            }
        })
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });

    socket.on("users", (chanel) => {
        Chanel.list_user_chanel(chanel).then((res) => {
            if (res === "Chanel not found") {
                console.log("/user: Chanel not found");
            } else {
                console.log("/user: action ok");
                var result = "";
                result += "User in room:\n"; 
                for (var user of res) {
                    result += user;
                    result += ", "; 
                }
                socket.emit("messages_user", result);
            }
        });
    });
});



server.listen(port, host, () => {
    console.log("Server is running on http://${host}:${port}");
});