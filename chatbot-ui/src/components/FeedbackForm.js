import React, { useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";  // ✅ FontAwesome stars

const FeedbackForm = ({ user, setFeedbackActive, setMessages }) => {
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState("");

    const submitFeedback = async () => {
        if (!rating || !comments) {
            alert("Please provide both a rating and comments.");
            return;
        }
        console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
        console.log('Feedback Endpoint:', process.env.REACT_APP_API_FEEDBACK_URL);
        
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_API_FEEDBACK_URL}`, {
                user,
                rating,
                comments
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "bot", content: "Thanks for your feedback! Feel free to chat anytime." }
            ]);
            setFeedbackActive(false);  // Return to chat
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback.");
        }
    };

    return (
        <div className="feedback-overlay">
            <div className="feedback-container">
                 <img src="/bot-logo.png"  alt="CAM Institute Logo" className="logo" />
                <h2>We’d love to hear your feedback! 😊</h2>
                <p>Please rate your experience and leave a comment.</p>

                {/* Star Rating */}
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className={`star ${star <= rating ? "selected" : ""}`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>

                <div className="feedback-field">
                    <label>Comments:</label>
                    <textarea
                        placeholder="Tell us about your experience..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    ></textarea>
                </div>

                <div className="feedback-buttons">
                    <button className="submit-btn" onClick={submitFeedback}>
                        Submit Feedback
                    </button>
                    <button className="cancel-btn" onClick={() => setFeedbackActive(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
