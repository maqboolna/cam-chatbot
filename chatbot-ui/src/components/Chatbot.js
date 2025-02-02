import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [user, setUser] = useState({ name: "", email: "" });
    const [showForm, setShowForm] = useState(true);
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        socket.on("botReply", (data) => {
            setTyping(false);
            setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
        });
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { role: "user", content: input }]);
        setTyping(true);
        socket.emit("chatMessage", { message: input, userName: user.name, email: user.email });
        setInput("");
    };

    const handleFormSubmit = () => {
        if (user.name && user.email) setShowForm(false);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.div
                className="floating-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setOpen(true)}
            >
                <ChatIcon fontSize="large" />
            </motion.div>

            {/* Chat Window */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>
                    <img src="/bot-logo.png" alt="Bot" width="50" />
                    CAM Assistant
                </DialogTitle>
                <DialogContent dividers style={{ height: "300px", overflowY: "scroll" }}>
                    {showForm ? (
                        <>
                            <TextField label="Name" fullWidth onChange={(e) => setUser({ ...user, name: e.target.value })} />
                            <TextField label="Email" fullWidth onChange={(e) => setUser({ ...user, email: e.target.value })} />
                            <Button variant="contained" onClick={handleFormSubmit}>Start Chat</Button>
                        </>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                                    <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
                                </div>
                            ))}
                            {typing && <div>Bot is typing...</div>}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." />
                    <Button onClick={handleSendMessage}>Send</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Chatbot;
