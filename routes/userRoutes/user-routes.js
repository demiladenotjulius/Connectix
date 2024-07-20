import express from 'express';
import { registerUser, loginUser, forgetPassword, getResetPassword, postResetPassword } from '../../controllers/userController/userController.js';
import { verifyEmailCode } from '../../controllers/userController/userController.js'
import { verify } from '../../middlewares/auth-middleware.js'; 

const userRouter = express.Router();

userRouter.post('/user-register', registerUser);
userRouter.post('/user-login', loginUser);
userRouter.post('/forget-password', forgetPassword);
userRouter.get('/reset-password/:id/:token', getResetPassword);
userRouter.post('/reset-password/:id/:token', postResetPassword);
userRouter.post('/verify-email-code', verifyEmailCode);

userRouter.get('/protected-route', verify, (req, res) => {
    res.status(200).json({ success: true, message: 'You are authorized', user: req.user });
  });
  
export default userRouter;
