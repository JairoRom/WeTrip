import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🌍 WeTrip
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">Inicio</Link></li>
          {token ? (
            <>
              <li><Link to="/admin">Admin</Link></li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;