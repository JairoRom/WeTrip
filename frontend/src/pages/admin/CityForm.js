import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCity, updateCity, getCityById } from '../../services/api';

function CityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    country: '',
    description: '',
    image: '',
    latitude: '',
    longitude: '',
    population: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const response = await getCityById(id);
        setForm(response.data.data);
      } catch (err) {
        setError('No se pudo cargar la ciudad');
      }
    };

    if (isEdit) loadCity();
  }, [id]);

  const loadCity = async () => {
    try {
      const response = await getCityById(id);
      setForm(response.data.data);
    } catch (err) {
      setError('No se pudo cargar la ciudad');
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
        await updateCity(id, form);
      } else {
        await createCity(form);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h1>{isEdit ? '✏️ Editar Ciudad' : '➕ Nueva Ciudad'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre *</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>País *</label>
          <input name="country" value={form.country || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} rows="4" />
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
        </div>
        <div className="form-group">
          <label>Población</label>
          <input name="population" value={form.population || ''} onChange={handleChange} type="number" />
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

export default CityForm;