import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCities, deleteCity, getPlacesByCity, deletePlace, togglePlace } from '../../services/api';

function Dashboard() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCities();
  }, [navigate]);

  // Filtrar ciudades cuando cambia la búsqueda
  useEffect(() => {
    if (!search) {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [search, cities]);

  const loadCities = async () => {
    try {
      const response = await getCities({ limit: 'all' });
      setCities(response.data.data);
      setFilteredCities(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaces = async (cityId) => {
    try {
      const response = await getPlacesByCity(cityId);
      setPlaces(response.data.data);
      setSelectedCity(cityId);

      // Auto-scroll a la sección de lugares
      setTimeout(() => {
        document.getElementById('places-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCity = async (id) => {
    if (!window.confirm('¿Eliminar esta ciudad?')) return;
    try {
      await deleteCity(id);
      loadCities();
      if (selectedCity === id) {
        setSelectedCity(null);
        setPlaces([]);
      }
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleDeletePlace = async (id) => {
    if (!window.confirm('¿Eliminar este lugar?')) return;
    try {
      await deletePlace(id);
      loadPlaces(selectedCity);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleTogglePlace = async (id) => {
    try {
      await togglePlace(id);
      loadPlaces(selectedCity);
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>⚙️ Panel de Administración</h1>
      <p>Bienvenido al back-office de WeTrip</p>

      <section>
        <div className="section-header">
          <h2>Ciudades ({filteredCities.length} de {cities.length})</h2>
          <Link to="/admin/cities/new" className="btn-primary" style={{ textDecoration: 'none', color: 'white' }}>
            ➕ Nueva Ciudad
          </Link>
        </div>

        {/* Buscador de ciudades */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Buscar ciudad por nombre o país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        {loading ? (
          <p>Cargando ciudades...</p>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => (
                  <tr key={city.id} className={selectedCity === city.id ? 'selected-row' : ''}>
                    <td>{city.name}</td>
                    <td>{city.country}</td>
                    <td>
                      <button onClick={() => loadPlaces(city.id)} className="btn-secondary">
                        Ver Lugares
                      </button>
                      <Link to={`/admin/cities/edit/${city.id}`} className="btn-edit">Editar</Link>
                      <button onClick={() => handleDeleteCity(city.id)} className="btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCity && (
        <section id="places-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Lugares de {cities.find(c => c.id === selectedCity)?.name} ({places.length})</h2>
            <Link
              to={`/admin/places/new?cityId=${selectedCity}`}
              className="btn-primary"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              ➕ Nuevo Lugar
            </Link>
          </div>
          {places.length === 0 ? (
            <p className="no-results">No hay lugares turísticos para esta ciudad</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Rating</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id}>
                    <td>{place.name}</td>
                    <td>{place.category}</td>
                    <td>{place.rating || '-'}</td>
                    <td>
                      <span className={place.active ? 'badge-active' : 'badge-inactive'}>
                        {place.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleTogglePlace(place.id)} className="btn-secondary">
                        {place.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <Link to={`/admin/places/edit/${place.id}`} className="btn-edit">Editar</Link>
                      <button onClick={() => handleDeletePlace(place.id)} className="btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;