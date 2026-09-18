import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createPlace, updatePlace, getCities, getPlaceById, getTags } from '../../services/api';

function PlaceForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    cityId: '',
    name: '',
    description: '',
    address: '',
    category: 'Monumento',
    image: '',
    latitude: '',
    longitude: '',
    rating: ''
  });

  // Etiquetas seleccionadas
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Buscador de ciudades
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingCities, setSearchingCities] = useState(false);
  const dropdownRef = useRef(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar etiquetas disponibles
        const tagsRes = await getTags();
        setAvailableTags(tagsRes.data.data.filter(t => t.active));

        // Ciudad desde URL
        const cityIdFromUrl = searchParams.get('cityId');
        if (cityIdFromUrl && !isEdit) {
          setForm(prev => ({ ...prev, cityId: cityIdFromUrl }));
          const res = await getCities({ limit: 'all' });
          const city = res.data.data.find(c => c.id === parseInt(cityIdFromUrl));
          if (city) setSelectedCityName(`${city.name} (${city.country})`);
        }

        // Cargar lugar si es edición
        if (isEdit) {
          try {
            const res = await getPlaceById(id);
            const place = res.data.data;

            setForm({
              cityId: place.cityId || '',
              name: place.name || '',
              description: place.description || '',
              address: place.address || '',
              category: place.category || 'Monumento',
              image: place.image || '',
              latitude: place.latitude || '',
              longitude: place.longitude || '',
              rating: place.rating || ''
            });

            // Etiquetas del lugar
            if (place.tags && place.tags.length > 0) {
              setSelectedTagIds(place.tags.map(t => t.id));
            }

            if (place.city) {
              setSelectedCityName(`${place.city.name} (${place.city.country})`);
            } else {
              setSelectedCityName(`Ciudad ID: ${place.cityId}`);
            }
          } catch (err) {
            console.error('Error cargando lugar:', err);
            setError('No se pudo cargar el lugar');
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };
    loadData();
  }, [id]);

  // Buscar ciudades con debounce
  useEffect(() => {
    if (!citySearch || citySearch.length < 2) {
      setCityResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingCities(true);
      try {
        const res = await getCities({ search: citySearch, limit: 20 });
        setCityResults(res.data.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error buscando ciudades:', err);
      } finally {
        setSearchingCities(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city) => {
    setForm(prev => ({ ...prev, cityId: city.id }));
    setSelectedCityName(`${city.name} (${city.country})`);
    setCitySearch('');
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cityId) {
      setError('Debes seleccionar una ciudad');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, tagIds: selectedTagIds };
      if (isEdit) {
        await updatePlace(id, payload);
      } else {
        await createPlace(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Monumento', 'Museo', 'Parque', 'Playa', 'Restaurante', 'Centro Comercial', 'Histórico', 'Naturaleza'];

  return (
    <div className="admin-form">
      <h1>{isEdit ? '✏️ Editar Lugar Turístico' : '➕ Nuevo Lugar Turístico'}</h1>
      <form onSubmit={handleSubmit}>

        {/* Buscador de ciudades */}
        <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label>Ciudad *</label>

          {form.cityId ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: '#f0f9ff',
              border: '1px solid #3b82f6',
              borderRadius: '6px'
            }}>
              <span style={{ flex: 1 }}>📍 <strong>{selectedCityName}</strong></span>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, cityId: '' }));
                    setSelectedCityName('');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem' }}
                  title="Cambiar ciudad"
                >✖</button>
              )}
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Escribe al menos 2 letras para buscar..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onFocus={() => cityResults.length > 0 && setShowDropdown(true)}
                autoComplete="off"
              />
              {searchingCities && <small style={{ color: '#666' }}>Buscando...</small>}
              {showDropdown && cityResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'white', border: '1px solid #ddd', borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '300px',
                  overflowY: 'auto', zIndex: 1000, marginTop: '4px'
                }}>
                  {cityResults.map(city => (
                    <div
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      📍 <strong>{city.name}</strong> <span style={{ color: '#666' }}>({city.country})</span>
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && citySearch.length >= 2 && !searchingCities && cityResults.length === 0 && (
                <small style={{ color: '#dc2626' }}>No se encontraron ciudades</small>
              )}
            </>
          )}
        </div>

        <div className="form-group">
          <label>Nombre *</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} rows="4" />
        </div>

        <div className="form-group">
          <label>Dirección (recomendado)</label>
          <input
            name="address"
            value={form.address || ''}
            onChange={handleChange}
            placeholder="Ej: Calle Gran Vía, 1, Madrid, España"
          />
          <small style={{ color: '#666' }}>
            Si la dirección es válida, se buscarán las coordenadas automáticamente.
          </small>
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select name="category" value={form.category || 'Monumento'} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Etiquetas */}
        <div className="form-group">
          <label>Etiquetas</label>
          {availableTags.length === 0 ? (
            <small style={{ color: '#666' }}>
              No hay etiquetas disponibles. Puedes crearlas en "Etiquetas" del menú.
            </small>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {availableTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      border: `2px solid ${tag.color}`,
                      background: isSelected ? tag.color : 'white',
                      color: isSelected ? 'white' : tag.color,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>URL de imagen</label>
          <input name="image" value={form.image || ''} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitud (opcional)</label>
            <input name="latitude" value={form.latitude || ''} onChange={handleChange} type="number" step="any" />
          </div>
          <div className="form-group">
            <label>Longitud (opcional)</label>
            <input name="longitude" value={form.longitude || ''} onChange={handleChange} type="number" step="any" />
          </div>
          <div className="form-group">
            <label>Rating (0-5)</label>
            <input name="rating" value={form.rating || ''} onChange={handleChange} type="number" step="0.1" min="0" max="5" />
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlaceForm;