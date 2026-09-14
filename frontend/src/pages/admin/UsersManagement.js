import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsers,
  createUser,
  updateUser,
  changeUserRole,
  toggleUser,
  deleteUser
} from '../../services/api';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios');
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
      if (editingUser) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await updateUser(editingUser.id, data);
      } else {
        await createUser(form);
      }
      resetForm();
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowForm(true);
  };

  const handleChangeRole = async (id, role) => {
    try {
      await changeUserRole(id, role);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleUser(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setForm({ username: '', email: '', password: '', role: 'viewer' });
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <div className="admin-dashboard">
      <h1>👥 Gestión de Usuarios</h1>
      <p>Administra los usuarios registrados y sus permisos</p>

      <div className="section-header" style={{ marginTop: '1.5rem' }}>
        <h2>Usuarios ({users.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✖ Cancelar' : '➕ Nuevo Usuario'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form" style={{ marginBottom: '1.5rem' }}>
          <h3>{editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de usuario *</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{editingUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required={!editingUser}
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="viewer">Viewer (solo lectura)</option>
                <option value="editor">Editor</option>
              </select>
              <small style={{ color: '#666' }}>
                El rol "admin" está reservado para el administrador principal.
              </small>
            </div>
            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingUser ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isMainAdmin = user.role === 'admin';
              const isSelf = user.id === currentUser.id;

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.username}
                    {isSelf && <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}> (tú)</span>}
                    {isMainAdmin && <span style={{ color: '#dc2626', fontWeight: 'bold' }}></span>}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {isMainAdmin ? (
                      <span className="badge-active" style={{ background: '#fef3c7', color: '#92400e' }}>
                        Admin
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={user.active ? 'badge-active' : 'badge-inactive'}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {isMainAdmin ? (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>
                        Administrador principal
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggle(user.id)}
                          className="btn-secondary"
                          disabled={isSelf}
                        >
                          {user.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => handleEdit(user)} className="btn-edit">
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn-danger"
                          disabled={isSelf}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.9rem' }}>
        <h4 style={{ marginTop: 0 }}>ℹ️ Jerarquía de roles</h4>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><strong>Admin:</strong> único administrador principal. No se puede eliminar, desactivar ni cambiar su rol.</li>
          <li><strong>Editor:</strong> puede gestionar contenido (ciudades y lugares).</li>
          <li><strong>Viewer:</strong> solo puede consultar el contenido.</li>
        </ul>
      </div>
    </div>
  );
}

export default UsersManagement;