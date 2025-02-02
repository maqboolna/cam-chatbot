import React, { useState } from "react";
import FloatingButton from "./components/FloatingButton";
import ChatWindow from "./components/ChatWindow";
import UserForm from "./components/UserForm";
import "./styles.css"; // Centralized CSS file

const App = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [user, setUser] = useState(null);

    const handleOpenChat = () => {
        console.log("Opening chat..."); // Debugging
        setIsChatOpen(true);
    };

    const handleUserSubmit = (userData) => {
        console.log("User Submitted:", userData); // Debugging
        setUser(userData);
    };

    return (
        <div className="app-container">
            {/* Floating Button - Should Open Chat Window */}
            {!isChatOpen && <FloatingButton onClick={handleOpenChat} />}

            {/* Chat Container - Should Show Chat When Opened */}
            {isChatOpen && (
                <div className="chat-container">
                    {!user ? (
                        <UserForm onSubmit={handleUserSubmit} onClose={() => setIsChatOpen(false)} />
                    ) : (
                        <ChatWindow user={user} onClose={() => setIsChatOpen(false)} />
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
