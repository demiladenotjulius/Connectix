import express from 'express';
import { registerUser, loginUser, forgetPassword, getResetPassword, postResetPassword } from '../../controllers/userController/userController.js';

const userRouter = express.Router();

userRouter.post('/user-register', registerUser);
userRouter.post('/user-login', loginUser);
userRouter.post('/forget-password', forgetPassword);
userRouter.get('/reset-password/:id/:token', getResetPassword);
userRouter.post('/reset-password/:id/:token', postResetPassword);

export default userRouter;
