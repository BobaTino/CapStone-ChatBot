import React, { useState } from "react";
import "./Chatbot.scss";

const urlRegex = /(https?:\/\/[^\s]+)/g; // Regular expression to detect URLs
const pdfRegex = /\.pdf$/i; // Regular expression to detect PDF links
const googleMapsRegex = /https?:\/\/(www\.)?google\.[a-z]+\/maps/; // Detect Google Maps links

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      // Simulate bot response with keyword detection
      setTimeout(() => {
        let botResponse = "";
        if (input.toLowerCase().includes("map")) {
          botResponse =
            "Here's a Google Map you requested: https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15759.659330181422!2d-117.4255636!3d33.9267253!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcb16afd188b9f%3A0xb46df41710f91790!2sDale%20E.%20and%20Sarah%20Ann%20Fowler%20Events%20Center!5e0!3m2!1sen!2sus!4v1630520989885!5m2!1sen!2sus";
        } else if (input.toLowerCase().includes("pdf")) {
          botResponse =
            "Here’s the PDF you requested: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        } else {
          botResponse = "Thank you for sending this! Here's what I found:";
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: botResponse,
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
        if (pdfRegex.test(part)) {
          // Render PDF embed if it's a PDF link
          return (
            <div className="embed-container-pdf" key={index}>
              <iframe
                src={part}
                title={`embedded-pdf-${index}`}
                className="pdf-frame"
              />
            </div>
          );
        } else if (googleMapsRegex.test(part)) {
          // Render Google Maps embed if it's a Google Maps link
          return (
            <div className="embed-container" key={index}>
              <iframe
                src={part}
                title={`embedded-map-${index}`}
                allowFullScreen
              />
            </div>
          );
        } else {
          // Render regular website embeds
          return (
            <div className="embed-container" key={index}>
              <iframe src={part} title={`embedded-${index}`} allowFullScreen />
            </div>
          );
        }
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
