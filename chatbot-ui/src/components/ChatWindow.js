import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import FeedbackForm from "./FeedbackForm";  // ✅ Import FeedbackForm

const ChatWindow = ({ user, onClose }) => {
    const [messages, setMessages] = useState(() => {
        // ✅ Load messages from localStorage if available
        const savedMessages = localStorage.getItem("chatMessages");
        return savedMessages
            ? JSON.parse(savedMessages)
            : [{ role: "bot", content: `👋 Hello **${user.name}**, how can I assist you today?` }];
    });

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [feedbackActive, setFeedbackActive] = useState(false);  // ✅ Feedback toggle

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        // ✅ Save messages to localStorage whenever they change
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        // ✅ Clear messages when the page is refreshed or closed
        const handleUnload = () => {
            localStorage.removeItem("chatMessages");
        };

        window.addEventListener("beforeunload", handleUnload);

        // ✅ Clean up event listener when component unmounts
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await axios.post("http://localhost:5000/chat", {
                user: user,
                message: input
            });

            // ✅ Detect feedback requirement from the backend response
            if (response.data.response.toLowerCase().includes("thank you for chatting with us")) {
                setFeedbackActive(true);  // Show feedback form
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: "bot", content: response.data.response }
                ]);
            }
            setIsTyping(false);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "bot", content: "Oops! Something went wrong." }
            ]);
            setIsTyping(false);
        }
    };

    const handleClose = () => {
        // ✅ Just close the chat window without clearing messages (but cleared on refresh/close)
        onClose();
    };

    return (
        <div className="chat-window">
      <div className="chat-header">
    <img src="/bot-logo.png" alt="CAM Logo" className="header-logo" />
    <button className="close-btn" onClick={handleClose}>×</button>
</div>


            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <strong>{msg.role === "bot" ? "CAMBot" : user.name}:</strong>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                ))}

                {isTyping && (
                    <div className="typing-indicator">
                        CAMBot is typing <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {feedbackActive ? (
                // ✅ Show feedback form if active
                <FeedbackForm user={user} setFeedbackActive={setFeedbackActive} setMessages={setMessages} />
            ) : (
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
