import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/homepage/homepage";
import LoginPage from "./components/Login/login";
import Signup from "./components/Signup/signup";
import UserFormPage from "./components/form/UserFormPage"; // 👈 create and import this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/get-started" element={<UserFormPage />} /> {/* 👈 new route */}
      </Routes>
    </Router>
  );
}

export default App;
