import React, { useEffect, useState } from "react";
import { user } from "../join/Join";
import socketIo from "socket.io-client";
import "./chat.css";
import sendLogo from "../../images/send.png";
import ReactScrollToBottom from "react-scroll-to-bottom";
import closeIcon from "../../images/closeIcon.png";
import Message from "../message/Message";
const ENDPOINT = "https://server-chat-app.vercel.app/";
// const ENDPOINT = "http://localhost:5000/";
let socket;
const Chat = () => {
  const [id, setid] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket = socketIo(ENDPOINT, {
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      const transport = socket.io.engine.transport.name; // in most cases, "polling"

      socket.io.engine.on("upgrade", () => {
        const upgradedTransport = socket.io.engine.transport.name; // in most cases, "websocket"
      });
    });

    socket.emit("joined", { user });
    socket.on("welcome", (data) => {
      setMessages([...messages, data]);
      setid(socket.id);
    });
    socket.on("userJoined", (data) => {
      setMessages([...messages, data]);
    });
    socket.on("leave", (data) => {
      setMessages([...messages, data]);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on("sendMessage", (data) => {
      setMessages([...messages, data]);
      //   console.log(data.user + data.message);
    });
    return () => {
      socket.off();
    };
  }, [messages]);

  const send = () => {
    const message = document.getElementById("chatInput").value;
    socket.emit("message", { message, id });
    document.getElementById("chatInput").value = "";
  };
  return (
    <div className="chatPage">
      <div className="chatContainer">
        <div className="header">
          <h2>C CHAT</h2>
          <a href="/">
            {" "}
            <img src={closeIcon} alt="Close" />
          </a>
        </div>
        <ReactScrollToBottom className="chatBox">
          {messages.map((item, i) => (
            <Message
              user={item.id === id ? "" : item.user}
              message={item.message}
              classs={item.id === id ? "right" : "left"}
            />
          ))}
        </ReactScrollToBottom>
        <div className="inputBox">
          <input
            onKeyPress={(event) => (event.key === "Enter" ? send() : null)}
            type="text"
            id="chatInput"
          />
          <button onClick={send} className="sendBtn">
            <img src={sendLogo} alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
