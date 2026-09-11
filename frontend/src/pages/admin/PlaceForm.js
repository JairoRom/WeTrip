import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPlace, updatePlace, getPlacesByCity, getCities } from '../../services/api';

function PlaceForm() {
  const { id } = useParams();
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
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await getCities();
      setCities(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await updatePlace(id, form);
      } else {
        await createPlace(form);
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
        <div className="form-group">
          <label>Ciudad *</label>
          <select name="cityId" value={form.cityId || ''} onChange={handleChange} required>
            <option value="">-- Selecciona una ciudad --</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name} ({city.country})</option>
            ))}
          </select>
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
          <label>Dirección</label>
          <input name="address" value={form.address || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Categoría</label>
          <select name="category" value={form.category || 'Monumento'} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>URL de imagen</label>
          <input name="image" value={form.image || ''} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Latitud</label>
            <input name="latitude" value={form.latitude || ''} onChange={handleChange} type="number" step="any" />
          </div>
          <div className="form-group">
            <label>Longitud</label>
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