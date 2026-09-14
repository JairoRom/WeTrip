import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CityDetail from './pages/CityDetail';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import CityForm from './pages/admin/CityForm';
import PlaceForm from './pages/admin/PlaceForm';
import UsersManagement from './pages/admin/UsersManagement';
import MyFavorites from './pages/MyFavorites';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/city/:id" element={<CityDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/cities/new" element={<CityForm />} />
          <Route path="/admin/cities/edit/:id" element={<CityForm />} />
          <Route path="/admin/places/new" element={<PlaceForm />} />
          <Route path="/admin/places/edit/:id" element={<PlaceForm />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/favorites" element={<MyFavorites />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;