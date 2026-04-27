import React from 'react';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, Bell } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{title || 'Dashboard'}</h1>
      </div>
      <div className="navbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">System Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
