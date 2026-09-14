import User from '../models/User.js';

// Listar todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Crear usuario (solo admin) - el rol 'admin' está PROHIBIDO
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 🔒 Verificar duplicados
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // 🔒 PROHIBIR crear admin desde la interfaz
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede crear un usuario con rol admin'
      });
    }

    // Solo permitir viewer o editor
    const allowedRoles = ['viewer', 'editor'];
    const finalRole = allowedRoles.includes(role) ? role : 'viewer';

    const user = await User.create({
      username,
      email,
      password,
      role: finalRole
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Actualizar usuario (solo admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 🔒 No se puede modificar al admin principal
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede modificar al administrador principal'
      });
    }

    // 🔒 No se puede asignar el rol admin
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede asignar el rol admin'
      });
    }

    const updateData = { username, email, role };
    if (password) updateData.password = password;

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// Cambiar rol (solo admin) - prohibido asignar 'admin'
export const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 🔒 Solo permitir viewer o editor
    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Solo se permite viewer o editor'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 🔒 No se puede cambiar el rol del admin principal
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede modificar el rol del administrador principal'
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: `Rol actualizado a ${role}`,
      data: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar rol',
      error: error.message
    });
  }
};

// Activar/desactivar usuario (solo admin)
export const toggleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 No se puede desactivar al admin principal
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivarte a ti mismo'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 🔒 No se puede desactivar al admin principal
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede desactivar al administrador principal'
      });
    }

    user.active = !user.active;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.active ? 'activado' : 'desactivado'}`,
      data: { id: user.id, active: user.active }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 No se puede eliminar a sí mismo
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // 🔒 No se puede eliminar al admin principal
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar al administrador principal'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};