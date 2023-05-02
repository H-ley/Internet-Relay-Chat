import "../css/Message_bar.css";
import Chat from "./Chat.js";
import React, { useState, useEffect } from 'react';

const Message = () => {

    const [msg, setMessage] = useState("");
    const [msgData, setMessageData] = useState("");

    return (
        <React.Fragment>
            <Chat message={msgData} />
            <div className="message_bar">
                <input type="text" name="msg" id="msg" placeholder="Envoyer un message" onChange={(e) => { setMessage(e.target.value) }} />
                <button type="submit" onClick={e => setMessageData(msgData + " " + msg)}> Envoyer</button>
            </div>
        </React.Fragment>
    );
}

export default Message;