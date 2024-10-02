// Chatbot.tsx
import React, { useState } from "react";
import "./Chatbot.scss";

const urlRegex = /(https?:\/\/[^\s]+)/g; // Regular expression to detect URLs

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      // Simulate bot response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Thank you for sending this! Here's what I found:",
            sender: "bot",
          },
        ]);
      }, 1000);
    }
  };

  // Function to render message and embed any URLs as iframes
  const renderMessage = (message: string) => {
    const parts = message.split(urlRegex); // Split message based on URLs
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // If part is a URL, render as an iframe
        return (
          <div className="embed-container" key={index}>
            <iframe src={part} title={`embedded-${index}`} allowFullScreen />
          </div>
        );
      }
      // Render normal text
      return <span key={index}>{part}</span>;
    });
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
        </ul>
      </div>

      {/* Chat Window */}
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
              {renderMessage(message.text)}
            </div>
          ))}
        </div>

        {/* Input Area */}
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
