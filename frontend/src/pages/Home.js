import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCities } from '../services/api';

function Home() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1, limit: 20 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce: esperar 400ms después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Cargar ciudades cuando cambia la página o la búsqueda
  useEffect(() => {
    loadCities(pagination.currentPage, debouncedSearch);
  }, [pagination.currentPage, debouncedSearch]);

  const loadCities = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await getCities({ page, limit: 20, search: searchTerm });
      setCities(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error cargando ciudades:', err);
      setError('No se pudieron cargar las ciudades');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Volver a la página 1 al buscar
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generar botones de paginación (máximo 7 visibles)
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

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
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </header>

      <section className="cities-section">
        {loading && <p className="loading">Cargando ciudades...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && (
          <>
            <h2>Ciudades disponibles ({pagination.total})</h2>
            {cities.length === 0 ? (
              <p className="no-results">No se encontraron ciudades</p>
            ) : (
              <>
                <div className="cities-grid">
                  {cities.map((city) => (
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

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => goToPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Anterior
                    </button>

                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`dots-${index}`} className="pagination-dots">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    <button
                      onClick={() => goToPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="pagination-btn"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;