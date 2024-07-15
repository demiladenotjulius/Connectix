import express from 'express';
import twofactor from 'node-2fa'
import qrcode from 'qrcode';
// import bodyParser from 'body-parser';
import { User } from '../../models/userModel.js';

const authRouter = express.Router();

authRouter.post('/enable-2fa', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newSecret = twofactor.generateSecret({ name: 'MyApp', account: email });
      user.twoFASecret = newSecret.secret;
      await user.save();
  
      qrcode.toDataURL(newSecret.uri, (err, imageUrl) => {
        if (err) {
          return res.status(500).json({ error: 'Error generating QR code' });
        }
        res.json({ qrCodeUrl: imageUrl, secret: newSecret.secret });
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  
authRouter.post('/verify-2fa', async (req, res) => {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user || !user.twoFASecret) {
        return res.status(404).json({ error: 'User or secret not found' });
      }
  
      const verified = twofactor.verifyToken(user.twoFASecret, token);
      if (verified && verified.delta === 0) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, error: 'Invalid token' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });


export default authRouter