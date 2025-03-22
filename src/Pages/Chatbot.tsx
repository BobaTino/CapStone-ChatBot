import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "./Chatbot.scss";

const urlRegex = /(https?:\/\/[^\s]+)/g;
const pdfRegex = /\.pdf$/i;
const googleMapsRegex = /https?:\/\/(www\.)?google\.[a-z]+\/maps/;

const startingPrompts = [
  "Where is the Yeager Center?",
  "Tell me about the Fowler Events Center.",
  "What is the general rule at CBU?",
];

const Chatbot: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [chatHistories, setChatHistories] = useState<{
    [key: string]: {
      name: string;
      messages: { text: string; sender: string; rating?: string; feedback?: string }[];
    };
  }>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  // State to track if the user is a staff member
  var [isStaff, setIsStaff] = useState<boolean>(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const checkIsStaff = async () => {
      try {
      console.log("Calling checkIsStaff for userId:", userId); // Log the function call
      const response = await fetch(`/api/checkIsStaff?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("checkIsStaff response:", data); // Log the response
        const isStaffValue = data.isStaff.toString() === "true";
        localStorage.setItem("isStaff", isStaffValue.toString());
        setIsStaff(isStaffValue);
      } else {
        console.error("Failed to check isStaff status");
      }
      } catch (err) {
      console.error("Error checking isStaff status:", err);
      }
    };

    checkIsStaff();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const storedIsStaff = localStorage.getItem("isStaff") === "true"; // Retrieve isStaff status from local storage
    console.log("Retrieved isStaff from local storage:", storedIsStaff); // Log the retrieved value
    setIsStaff(storedIsStaff); // Set the isStaff state based on the stored value

    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/getChats?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const chats = data.reduce((acc: any, chat: any) => {
            acc[chat._id] = {
              name: chat.chat_name,
              messages: chat.messages.map((message: any) => ({
                text: message.content,
                sender: message.sender_ID === userId ? "user" : "bot",
              })),
            };
            return acc;
          }, {});
          setChatHistories(chats);
          setActiveChatId(Object.keys(chats)[0] || null); // Load the first chat by default
        } else {
          console.error("Failed to fetch chats");
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    if (isStaff) {
      setShowPopup(true);
    }
  }, [isStaff]);

  const createNewChat = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found in local storage");
      return;
    }

    try {
      const response = await fetch("/api/saveChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatName: `Conversation ${Object.keys(chatHistories).length + 1}`,
          userId: userId,
          messages: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistories((prev) => ({
          ...prev,
          [data.chatId]: {
            name: `Conversation ${Object.keys(prev).length + 1}`,
            messages: [],
          },
        }));
        setActiveChatId(data.chatId);
      } else {
        console.error("Failed to save chat");
      }
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  const renameChat = (chatId: string, newName: string) => {
    setChatHistories((prev) => ({
      ...prev,
      [chatId]: { ...prev[chatId], name: newName },
    }));
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch("/api/deleteChat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (response.ok) {
        setChatHistories((prev) => {
          const updated = { ...prev };
          delete updated[chatId];

          // Update the active chat ID if the deleted chat was active
          const remainingChats = Object.keys(updated);
          setActiveChatId(remainingChats.length > 0 ? remainingChats[0] : null);

          return updated;
        });
      } else {
        console.error("Failed to delete chat");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleSend = async (customInput?: string) => {
    const message = customInput || input;
    if (!message.trim() || !activeChatId) return;

    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found in local storage");
      return;
    }

    setChatHistories((prev) => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [
          ...prev[activeChatId].messages,
          { text: message, sender: "user" },
        ],
      },
    }));
    setInput("");
    setLoading(true);

    try {
      console.log("Sending message to saveMessage API"); // Log the request
      const response = await fetch("/api/saveMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: userId,
          content: message,
          chatId: activeChatId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save message");
      }

      console.log("Sending user query to user_query API"); // Log the request
      const queryResponse = await fetch("/api/user_query/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          chatId: activeChatId,
          userId: userId,
        }),
      });

      const queryData = await queryResponse.json();

      if (!queryResponse.ok) {
        console.error("Failed to send user query to message handler");
      } else {
        console.log("isStaff status from server:", queryData.isStaff); // Log the isStaff status
        localStorage.setItem("isStaff", queryData.isStaff.toString());
        setIsStaff(queryData.isStaff);
      }
    } catch (err) {
      console.error("Error saving message or sending user query:", err);
    }

    setTimeout(async () => {
      let botResponse = "";

      const cbuLocations: { [key: string]: string } = {
        "fowler events center":
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.5598803521675!2d-117.42556362384789!3d33.92672532434678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcb16afd188b9f%3A0xb46df41710f91790!2sDale%20E.%20and%20Sarah%20Ann%20Fowler%20Events%20Center!5e0!3m2!1sen!2sus!4v1730927822254!5m2!1sen!2sus",
        "yeager center":
          "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13241.801507207558!2d-117.4272699!3d33.9295427!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcb0e611a7b2df%3A0x6ac7a35e919a3e9b!2sYeager%20Center!5e0!3m2!1sen!2sus!4v1730927043147!5m2!1sen!2sus",
      };

      for (const location in cbuLocations) {
        if (message.toLowerCase().includes(location)) {
          botResponse = `Here's the Google Map for the ${location}: ${cbuLocations[location]}`;
          break;
        }
      }

      if (!botResponse) {
        botResponse =
          "Apologies, but this is just a placeholder response. Once we're connected to the backend, you'll get a response from our bot!";
        if (isStaff) {
          botResponse += " (Note that you are a CBU staff member who has access to the full chatbot.)";
        }
      }

      console.log("isStaff status before final bot response:", isStaff); // Log the isStaff status before final bot response
      console.log("Final bot response:", botResponse); // Log the final bot response

      setChatHistories((prev) => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: [
            ...prev[activeChatId].messages,
            { text: botResponse, sender: "bot" },
          ],
        },
      }));
      setLoading(false);

      // Save the bot response to the backend
      try {
        console.log("Saving bot response to saveMessage API"); // Log the request
        const response = await fetch("/api/saveMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: "bot",
            content: botResponse,
            chatId: activeChatId,
          }),
        });

        if (!response.ok) {
          console.error("Failed to save bot message");
        }
      } catch (err) {
        console.error("Error saving bot message:", err);
      }
    }, 1000);
  };

  const handleRating = async (chatId: string, messageIndex: number, rating: string, feedback?: string) => {
    setChatHistories((prev) => {
      const updatedMessages = [...prev[chatId].messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        rating,
        feedback,
      };
      return {
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: updatedMessages,
        },
      };
    });

    // Save the rating and feedback to the backend
    try {
      await fetch("/api/saveMessageRating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          messageIndex,
          rating,
          feedback,
        }),
      });
    } catch (err) {
      console.error("Error saving message rating:", err);
    }
  };

  const renderMessage = (message: { text: string; sender: string; rating?: string; feedback?: string }, index: number) => {
    const parts = message.text.split(urlRegex);
    return (
      <div key={index} className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}>
        {parts.map((part, i) => {
          if (urlRegex.test(part)) {
            if (pdfRegex.test(part)) {
              return (
                <div className="embed-container-pdf" key={i}>
                  <iframe src={part} title={`embedded-pdf-${i}`} className="pdf-frame" />
                </div>
              );
            } else if (googleMapsRegex.test(part)) {
              return (
                <div className="embed-container" key={i}>
                  <iframe src={part} title={`embedded-map-${i}`} allowFullScreen />
                </div>
              );
            } else {
              return (
                <div className="embed-container" key={i}>
                  <iframe src={part} title={`embedded-${i}`} allowFullScreen />
                </div>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
        {message.sender === "bot" && !message.rating && (
          <div className="rating-buttons">
            <button onClick={() => handleRating(activeChatId!, index, "helpful")}>Helpful</button>
            <button onClick={() => handleRating(activeChatId!, index, "not helpful")}>Not Helpful</button>
          </div>
        )}
        {message.rating === "not helpful" && !message.feedback && (
          <div className="feedback-input">
            <textarea
              placeholder="Please provide feedback..."
              onBlur={(e) => handleRating(activeChatId!, index, "not helpful", e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chatbot-layout ${theme}`}>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Full Chatbot Privileges Enabled</h2>
            <p>As a staff member, the chatbot will have no limits in regards to its stored source material.</p>
            <button onClick={() => setShowPopup(false)}>Ok</button>
          </div>
        </div>
      )}
      <div className="sidebar">
        <h3>Conversations</h3>
        <ul>
          {Object.entries(chatHistories).map(([id, chat]) => (
            <li
              key={id}
              className={id === activeChatId ? "active" : ""}
              onClick={() => setActiveChatId(id)}
            >
              <span>{chat.name}</span>
              <button
                onClick={() =>
                  renameChat(id, prompt("Rename chat:", chat.name) || chat.name)
                }
              >
                Rename
              </button>
              <button onClick={() => deleteChat(id)}>Delete</button>
            </li>
          ))}
        </ul>
        <button onClick={createNewChat}>New Conversation</button>
        <button onClick={toggleTheme}>
          Switch to {theme === "light" ? "dark" : "light"} theme
        </button>
      </div>

      <div className="chatbot-container">
        {activeChatId && (
          <>
            <div className="header">{chatHistories[activeChatId].name}</div>
            <div className="chat-window">
              {chatHistories[activeChatId].messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  {renderMessage(message, index)}
                </div>
              ))}
              {loading && (
                <div className="message bot-message loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            {chatHistories[activeChatId].messages.length === 0 && (
              <div className="starting-prompts">
                <h4>Start with a prompt:</h4>
                <ul>
                  {startingPrompts.map((prompt, index) => (
                    <li key={index}>
                      <button onClick={() => handleSend(prompt)}>
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={() => handleSend()}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
