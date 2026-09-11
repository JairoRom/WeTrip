import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Función para generar token
export const generateToken = (userId, username, role) => {
  return jwt.sign(
    { 
      id: userId, 
      username, 
      role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Función para verificar token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Exportaciones por defecto (opcional)
export default { generateToken, verifyToken };