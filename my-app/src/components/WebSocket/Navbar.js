// src/components/WebSocket/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/Homepage">首頁</Link></li>
        <li><Link to="/Webspeek">語音評級</Link></li>
        <li><Link to="/files">檔案管理</Link></li>
        <li><Link onClick={handleLogout}>登出</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
