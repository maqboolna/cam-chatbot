import React from "react";
import { motion } from "framer-motion";

const FloatingButton = ({ onClick }) => {
    return (
        <motion.button
            className="floating-button"
            onClick={onClick}
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            whileHover={{ scale: 1.2, rotate: 5 }}
            style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                border: "none",
                borderRadius: "50%",
                padding: "4px",
                backgroundColor: "#0056b3",
                color: "#fff",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <img
                src="/bot-logo.png"
                alt="CAM Bot"
                style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
            />
            <motion.div
                className="laser-effect"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                    position: "absolute",
                    width: "90px",
                    height: "90px",
                    background: "rgba(0, 123, 255, 0.4)",
                    borderRadius: "50%",
                    boxShadow: "0 0 30px rgba(0, 123, 255, 0.8)",
                }}
            ></motion.div>
        </motion.button>
    );
};

export default FloatingButton;
