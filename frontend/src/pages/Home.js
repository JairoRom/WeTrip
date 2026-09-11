import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCities } from '../services/api';

function Home() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      const response = await getCities();
      setCities(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando ciudades:', err);
      setError('No se pudieron cargar las ciudades');
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      <header className="hero">
        <h1>🌍 Descubre tu próximo destino</h1>
        <p>Consulta el clima y los mejores lugares turísticos de cualquier ciudad</p>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar ciudad o país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <section className="cities-section">
        {loading && <p className="loading">Cargando ciudades...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && (
          <>
            <h2>Ciudades disponibles ({filteredCities.length})</h2>
            {filteredCities.length === 0 ? (
              <p className="no-results">No se encontraron ciudades</p>
            ) : (
              <div className="cities-grid">
                {filteredCities.map((city) => (
                  <Link to={`/city/${city.id}`} key={city.id} className="city-card">
                    {city.image && (
                      <img src={city.image} alt={city.name} className="city-image" />
                    )}
                    <div className="city-info">
                      <h3>{city.name}</h3>
                      <p className="country">{city.country}</p>
                      {city.description && (
                        <p className="description">{city.description.substring(0, 100)}...</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;