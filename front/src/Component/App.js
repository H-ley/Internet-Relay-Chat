import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";
import "./App.css";
import "../css/NickName.css";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chanel, setChanel] = useState([]);

  function changeUsername(username) {
    setUsername(username);
  }

  const Enter = () => {
    if (username) {
      socket.emit("create user", username);
      socket.emit("join_room", "General", "", username);
      setShowChat(true);
    }
  };

  socket.on("join_room", (obj) => {
    var tmp = JSON.parse(obj)
    setChanel(tmp[0]);
  });

  return (
    <div>
      {!showChat ? (
        <div className="nickname">
          <div className="content">
            <h3>Welcome to our App!</h3>
            <label id="nickname">Enter your username</label>
            <p>
              <input
                type="text"
                placeholder="Pseudo"
                onChange={(event) => {
                  setUsername(event.target.value);
                }}
              />
            </p>
            <button type="submit" onClick={Enter} className="btn">Enter</button>
          </div>
        </div>
      ) : (
        <Chat socket={socket} username={username} changeUsername={changeUsername} chanel={chanel} />
      )}
    </div>
  );
}
export default App;