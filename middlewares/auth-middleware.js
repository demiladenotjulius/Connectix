import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verify = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header not found!' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token not found!' });
    }

    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      req.user = decodedToken.id;
      next();
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
