import "./App.css";
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, changeUsername, chanel }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  function myMessageData() {
    const messageData = {
      room: chanel.name,
      author: username,
      message: currentMessage,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    };
    return (messageData)
  }

  function myMessageData2(chanelName, pseudo, msg) {
    const messageData2 = {
      room: chanelName,
      author: pseudo,
      message: msg,
      time: ""
    };
    return (messageData2)
  }

  // if (chanel.message !== undefined) {
  //   const chanItems = chanel.message.map((chan, index) => {
  //     const messageData = myMessageData();
  //     //console.log(chan.message);
  //     messageData.message = chan.message
  //     messageData.author = chan.pseudo
  //     //setMessageList((list) => [...list, messageData]);
  //   });
  // }

  const sendMessage = async () => {
    const arr = currentMessage.split(' ');
    const messageData = myMessageData()

    switch (arr[0]) {
      case "":
        break;
      // check if room already exists
      case "/nick":
        if (arr[1]) {
          changeUsername(arr[1]);
          socket.emit("rename", username, arr[1]);
          console.log("%s is renamed by '%s'", username, arr[1]);
        } else {
          console.log("Username can't be empty");
        }
        setCurrentMessage("");
        break;
      // check if room already exists
      case "/create":
        if (arr[1]) {
          socket.emit("create room", arr[1]);
          console.log("room '%s' is created", arr[1]);
          setCurrentMessage("");
        }
        break;
      // check if room already exists
      case "/join":
        if (arr[1]) {
          socket.emit("join_room", arr[1], chanel.name, username);
          chanel.name = arr[1];
          setMessageList(() => []);
          setCurrentMessage("");
          socket.once("list msg", function(obj) {
            var tmp = JSON.parse(obj);
            tmp.map((msg, index) => {
              var messageJoin = [];
              messageJoin =  myMessageData2(chanel.name, msg.pseudo, msg.message);
              setMessageList((list) => [...list, messageJoin])
            })
          });
          console.log("You enter in the room '%s'", arr[1]);
        }
        break;
      // check if room still exists
      case "/delete":
        if (arr[1] === chanel.name) {
          console.log("Leave the channel before deleting it");
        } else {
          socket.emit("delete room", arr[1]);
          console.log("Room '%s' has been deleted", arr[1]);
        }
        setCurrentMessage("");
        break;
      case "/quit":
        socket.emit("quit", arr[1], username);
        console.log("Someone leave the room '%s' ", arr[1]);
        socket.emit("join_room", "General", username);
        chanel.name = "General";
        setMessageList(() => []);
        setCurrentMessage("");
        socket.once("list msg", function(obj) {
          var tmp = JSON.parse(obj);
          tmp.map((msg, index) => {
            var messageJoin = [];
            messageJoin =  myMessageData2(chanel.name, msg.pseudo, msg.message);
            setMessageList((list) => [...list, messageJoin])
          })
        });
        console.log("You enter in the room '%s'", arr[1]);
        break;
      case "/list":
        if (!arr[1])
          socket.emit("list", "");
        else
          socket.emit("list", arr[1]);
        socket.once('messages', function (chanels) {
          console.log(chanels)
          messageData.message = chanels
          console.log(messageData)
          setMessageList((list) => [...list, messageData]);
        });
        setCurrentMessage("");
        break;
      case "/users":
        socket.emit("users", chanel.name);
        socket.once('messages_user', function (listUsers) {
          console.log(listUsers)
          messageData.message = listUsers
          console.log(messageData)
          setMessageList((list) => [...list, messageData]);
        });
        break;
      // case "/msg":
      //   socket.emit("private message", {
      //     content,
      //     to: this.selectedUser.userID,
      //   });
      //   this.selectedUser.messages.push({
      //     content,
      //     fromSelf: true,
      //   });
      //  setCurrentMessage("");
      default:
        await socket.emit("send_message", chanel.name, messageData);
        setMessageList((list) => [...list, messageData]);
    }
    setCurrentMessage("");
  };

  socket.on("delete room", (msg) => {
    console.log(msg);
  });

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat">
      <div className="live-chat">
        <p>Room : {chanel.name}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="message_bar">
        <input type="text" value={currentMessage} placeholder="Write a message..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;