import React, { useState } from "react";

const UserForm = ({ onSubmit, onClose }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && email) {
            onSubmit({ name, email });
        }
    };

    return (
        <div className="user-form" style={{
            width: "300px",
            padding: "20px",
            backgroundColor: "#1f1f1f",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            position: "relative",
            margin: "0 auto",
            textAlign: "center"
        }}>
            <button
                onClick={onClose}
                style={{
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "24px",
                    cursor: "pointer",
                    zIndex: 10,
                }}
                aria-label="Close chat form"
            >
                &#10005;
            </button>

            <img src="/bot-logo.png" alt="Chatbot Logo" className="chat-logo" style={{
                width: "70px",
                height: "70px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "10px"
            }} />
            <h3 style={{ color: "#ffffff", fontSize: "22px", textAlign: "center", margin: "10px 0" }}>Welcome to CAM Chatbot!</h3>
            <p style={{ color: "#cccccc", textAlign: "center", margin: "5px 0" }}>Please enter your details to continue.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                />
                <input 
                    type="email" 
                    placeholder="Your Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                />
                <button 
                    type="submit" 
                    style={{
                        padding: "10px 15px",
                        backgroundColor: "#007bff",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                >
                    Start Chat
                </button>
            </form>
        </div>
    );
};

export default UserForm;
