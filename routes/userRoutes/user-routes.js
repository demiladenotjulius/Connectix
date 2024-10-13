import express from 'express';
import { initialRegister, updateAdditionalInfo, completeRegistration, loginUser, forgetPassword, getResetPassword, postResetPassword ,changePassword } from '../../controllers/userController/userController.js';
import { verifyEmailCode } from '../../controllers/userController/userController.js'
// import { verify } from '../../middlewares/auth-middleware.js'
import { generateEventImage} from '../../controllers/imageaGenerator/imageGenerator.js'
// import { authMiddleware } from '../../middlewares/verifyEmail/verifyemail.js'
import path  from 'path'
const userRouter = express.Router();

// userRouter.post('/user-register', registerUser);
// userRouter.post('/saved-data', savedData);
userRouter.post('/user-login', loginUser);
userRouter.post('/forget-password', forgetPassword);
userRouter.get('/reset-password/:id/:token', getResetPassword);
userRouter.post('/reset-password/:id/:token', postResetPassword);
userRouter.post('/change-password', changePassword);
userRouter.post('/verify-email-code', verifyEmailCode);
userRouter.post('/initial', initialRegister);
userRouter.post('/update', updateAdditionalInfo);
userRouter.post('/complete', completeRegistration);



userRouter.post('/generate-image', async (req, res) => {
  const { eventName, eventDate } = req.body;
  if (!eventName || !eventDate) {
    return res.status(400).json({ success: false, message: 'Event name and date are required' });
  }
  try {
    const imagePath = await generateEventImage(eventName, eventDate);
    const filename = path.basename(imagePath);
    res.json({ 
      success: true, 
      message: 'Image generated successfully', 
      imageUrl: `/images/${filename}` 
    });
  } catch (error) {
    console.error('Error in generate-image route:', error);
    res.status(500).json({ success: false, message: 'Failed to generate image' });
  }
});
  
export default userRouter;
