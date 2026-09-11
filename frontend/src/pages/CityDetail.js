import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCityDetail } from '../services/api';
import MapView from '../components/MapView';

function CityDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCityDetail = async () => {
      try {
        setLoading(true);
        const response = await getCityDetail(id);
        setData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando ciudad:', err);
        setError('No se pudo cargar la información de la ciudad');
      } finally {
        setLoading(false);
      }
    };

    loadCityDetail();
  }, [id]);

  if (loading) return <p className="loading">Cargando información...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="error">Ciudad no encontrada</p>;

  const { city, weather, places } = data;

  return (
    <div className="city-detail">
      <Link to="/" className="back-link">← Volver</Link>

      <header className="city-header">
        <h1>{city.name}</h1>
        <p className="country">{city.country}</p>
        {city.description && <p className="description">{city.description}</p>}
      </header>

      {weather && (
        <section className="weather-section">
          <h2>🌤️ Clima actual</h2>
          <div className="weather-card">
            <div className="weather-temp">{weather.temperature}°C</div>
            <div className="weather-info">
              <p className="weather-desc">{weather.description}</p>
              <p>Sensación: {weather.feels_like}°C</p>
              <p>Humedad: {weather.humidity}%</p>
              <p>Viento: {weather.windSpeed} km/h</p>
            </div>
          </div>
        </section>
      )}

      <section className="map-section">
        <h2>🗺️ Mapa de {city.name}</h2>
        <MapView city={city} places={places} />
      </section>

      <section className="places-section">
        <h2>📍 Lugares turísticos recomendados</h2>
        {places.length === 0 ? (
          <p className="no-results">No hay lugares turísticos disponibles</p>
        ) : (
          <div className="places-grid">
            {places.map((place) => (
              <div key={place.id} className="place-card">
                {place.image && (
                  <img src={place.image} alt={place.name} className="place-image" />
                )}
                <div className="place-info">
                  <h3>{place.name}</h3>
                  <span className="place-category">{place.category}</span>
                  {place.rating && <span className="place-rating">⭐ {place.rating}</span>}
                  {place.description && <p>{place.description}</p>}
                  {place.address && <p className="address">📍 {place.address}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CityDetail;