// Chatbot.tsx
import React, { useState } from "react";
import "./Chatbot.scss";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Simulate bot response (this would be an API call in a real app)
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Hello, how can I assist you?", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="chatbot-layout">
      {/* Sidebar for stored conversations */}
      <div className="sidebar">
        <h3>Conversations</h3>
        <ul>
          <li>Conversation 1</li>
          <li>Conversation 2</li>
          <li>Conversation 3</li>
          <li>...</li>
        </ul>
      </div>

      {/* Main chat window */}
      <div className="chatbot-container">
        <div className="header">Chatbot</div>
        <div className="chat-window">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
