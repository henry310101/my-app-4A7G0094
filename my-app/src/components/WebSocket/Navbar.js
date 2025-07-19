// src/components/WebSocket/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("登出成功");
    onLogout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/Homepage">首頁</Link></li>
        <li><Link to="/Webspeek">發音評級</Link></li>
        <li><Link to="/files">題庫</Link></li>
        <li><Link to="/Record">記錄</Link></li>
        <li><Link onClick={handleLogout}>登出</Link></li>
        
      </ul>
    </nav>
  );
};

export default Navbar;
