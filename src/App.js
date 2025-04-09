import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateNote from "./components/CreateNote";
import ViewNote from "./components/ViewNote";
import { motion } from "framer-motion";

const App = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "enabled"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="dark-mode-toggle">
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </motion.button>
      </div>
      <Routes>
        <Route path="/" element={<CreateNote />} />
        <Route path="/note/:id" element={<ViewNote />} />
      </Routes>
    </Router>
  );
};

export default App;
