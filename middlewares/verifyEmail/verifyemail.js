// import jwt from 'jsonwebtoken';
// import { User } from '../../models/User/userModel.js';
// import { handleErrors } from '../../middlewares/errorHandler.js';

// export const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.SECRET);

//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     user.verified = true;
//     await user.save();

//     res.status(200).json({ success: true, message: 'Email verified successfully' });
//   } catch (error) {
//     handleErrors(error, res);
//   }
// };
