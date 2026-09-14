import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyFavorites, removeFavorite } from '../services/api';

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getMyFavorites();
      setFavorites(response.data.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cityId) => {
    if (!window.confirm('¿Quitar esta ciudad de favoritos?')) return;
    try {
      await removeFavorite(cityId);
      setFavorites(favorites.filter(fav => fav.cityId !== cityId));
    } catch (err) {
      alert('Error al quitar de favoritos');
    }
  };

  if (loading) return <p className="loading">Cargando favoritos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="favorites-page">
      <h1>⭐ Mis Ciudades Favoritas</h1>
      <p>Tu lista personal de destinos guardados</p>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>No tienes ciudades favoritas todavía.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', color: 'white' }}>
            🔍 Explorar ciudades
          </Link>
        </div>
      ) : (
        <div className="cities-grid" style={{ marginTop: '2rem' }}>
          {favorites.map((fav) => (
            <div key={fav.id} className="city-card" style={{ position: 'relative' }}>
              <Link to={`/city/${fav.city.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {fav.city.image && (
                  <img src={fav.city.image} alt={fav.city.name} className="city-image" />
                )}
                <div className="city-info">
                  <h3>{fav.city.name}</h3>
                  <p className="country">{fav.city.country}</p>
                  {fav.city.description && (
                    <p className="description">{fav.city.description.substring(0, 100)}...</p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => handleRemove(fav.cityId)}
                className="btn-danger"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.9rem'
                }}
                title="Quitar de favoritos"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyFavorites;