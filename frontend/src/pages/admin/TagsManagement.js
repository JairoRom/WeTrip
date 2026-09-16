import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTags, createTag, updateTag, deleteTag } from '../../services/api';

function TagsManagement() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#3b82f6' });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadTags();
  }, [navigate]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await getTags();
      setTags(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTag(editingTag.id, form);
      } else {
        await createTag(form);
      }
      resetForm();
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setForm({ name: tag.name, color: tag.color });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta etiqueta? Se quitará de todos los lugares.')) return;
    try {
      await deleteTag(id);
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setForm({ name: '', color: '#3b82f6' });
    setEditingTag(null);
    setShowForm(false);
  };

  return (
    <div className="admin-dashboard">
      <h1>🏷️ Gestión de Etiquetas</h1>
      <p>Crea etiquetas para clasificar los lugares turísticos (Gratis, Accesible, Familiar...)</p>

      <div className="section-header" style={{ marginTop: '1.5rem' }}>
        <h2>Etiquetas ({tags.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✖ Cancelar' : '➕ Nueva Etiqueta'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form" style={{ marginBottom: '1.5rem' }}>
          <h3>{editingTag ? '✏️ Editar Etiqueta' : '➕ Nueva Etiqueta'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Gratis, Accesible, Familiar..."
                required
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  name="color"
                  type="color"
                  value={form.color}
                  onChange={handleChange}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
                <input
                  name="color"
                  type="text"
                  value={form.color}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Vista previa */}
            <div className="form-group">
              <label>Vista previa</label>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '12px',
                  background: form.color,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                {form.name || 'Etiqueta'}
              </span>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingTag ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Cargando etiquetas...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : tags.length === 0 ? (
        <p className="no-results">No hay etiquetas todavía. Crea la primera.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '12px',
                      background: tag.color,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    {tag.name}
                  </span>
                </td>
                <td>
                  <span className={tag.active ? 'badge-active' : 'badge-inactive'}>
                    {tag.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(tag)} className="btn-edit">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="btn-danger">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TagsManagement;