import bcrypt from "bcryptjs";
import {
  sanitizePhoneNumber,
  passwordValidator,
  cloudinary,
  sendHtmlEmail,
  sendEmail,
} from "../../utils/index.js";
import { User } from "../../models/User/userModel.js";
import { handleErrors } from "../../middlewares/errorHandler.js";
import { authModel } from "../../models/auth/auth-model.js";
import jwt from "jsonwebtoken";

const period = 60 * 60 * 24 * 3;
const baseUrl = process.env.BASE_URL;

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET, { expiresIn: '1d' });
};
// export const registerUser = async (req, res) => {
//   try {
//     const { name, username, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already exists." });
//     }

//     if (!passwordValidator(password)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters",
//       });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);
//     const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

//     const newUser = new User({
//       email,
//       name,
//       username,
//       password: hashPassword,
//       verificationCode,
//       verified: false,
//     });

//     const savedUser = await newUser.save();

//     const subject = "Email Verification";
//     const text = `Your verification code is: ${verificationCode}`;

//     await sendEmail(email, subject, text);

//     res.status(201).json({
//       success: true,
//       message:
//         "Account Created Successfully. Please check your email to verify your account.",
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         email: savedUser.email,
//         username: savedUser.username,
//         verified: savedUser.verified,
//         credits: savedUser.credits
//       },
//     });
//   } catch (error) {
//     handleErrors(error, res);
//   }
// };


// export const verifyEmailCode = async (req, res) => {
//   try {
//     const { email, verificationCode } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (user.verificationCode !== verificationCode) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid verification code" });
//     }

//     user.verified = true;
//     user.verificationCode = undefined;
//     await user.save();

//     const subject = "Welcome to our Company";
//     const template = "welcomeMessage";
//     const context = {
//       name: user.name,
//     };

//     await sendHtmlEmail(email, subject, template, context);

//     res
//       .status(200)
//       .json({ success: true, message: "Email verified successfully" });
//   } catch (error) {
//     handleErrors(error, res);
//   }
// };

// Step 1: Initial Registration with Email Verification
export const initialRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    if (!passwordValidator(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const newUser = new User({
      email,
      name,
      password: hashPassword,
      verificationCode,
      verified: false,
      registrationStep: 1
    });

    const savedUser = await newUser.save();

    const subject = "Email Verification";
    const text = `Your verification code is: ${verificationCode}`;
    await sendEmail(email, subject, text);

    res.status(201).json({
      success: true,
      message: "Initial registration successful. Please verify your email.",
      userId: savedUser._id
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

// Email Verification
export const verifyEmailCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.verificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }
    user.verified = true;
    user.verificationCode = undefined;
    user.registrationStep = 2;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      userId: user._id,
      token: token  
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

// Step 2: Update Additional Information
export const updateAdditionalInfo = async (req, res) => {
  try {
    const { userId, username, gender, state } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.verified) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user or email not verified" });
    }

    user.username = username;
    user.gender = gender;
    user.state = state;
    user.registrationStep = 3;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Additional information updated successfully",
      userId: user._id
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

// Step 3: Complete Registration
export const completeRegistration = async (req, res) => {
  try {
    const { userId, stagename, musicstyle } = req.body;

    const user = await User.findById(userId);
    if (!user ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user or previous steps not completed" });
    }

    user.stagename = stagename;
    user.musicstyle = musicstyle;
    user.registrationStep = 'completed';

    await user.save();

    const subject = "Welcome to our Company";
    const template = "welcomeMessage";
    const context = {
      name: user.name,
    };
    await sendHtmlEmail(user.email, subject, template, context);

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        stagename: user.stagename,
        musicstyle: user.musicstyle,
        verified: user.verified
      },
    });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message: "User with the email or password not found",
        });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Please verify your email before logging in",
        });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    if (user.twoFASecret) {
      return res.status(200).json({
        success: true,
        message: "2FA Required",
        twoFARequired: true,
      });
    }

    jwt.sign(
      { id: user._id },
      process.env.SECRET,
      { expiresIn: "1hr" },
      async (err, token) => {
        if (err) {
          throw err;
        }
        res.cookie("userId", user._id, { maxAge: period, httpOnly: true });
        res.status(200).json({
          success: true,
          message: "User Login Successfully",
          user :{
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username
  
          },
          token,
        });
      }
    );
  } catch (error) {
    handleErrors(error, res);
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Attempting password reset for email:", email);

    // check if email exists
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      console.log("User not found for email:", email);
      return res
        .status(404)
        .json({
          success: false,
          message: "User with this email does not exist.",
        });
    }
    console.log("User found:", existingEmail._id);

    const token = jwt.sign(
      { email: existingEmail.email, id: existingEmail._id },
      process.env.SECRET,
      {
        expiresIn: "5m",
      }
    );
    console.log("JWT token generated");

    const link = `${baseUrl}/reset-password/${existingEmail._id}/${token}`;
    console.log("Reset link generated:", link);

    const subject = "Reset Your Password";
    const text = "Reset Your Password!";
    const template = "forgetPassword";
    const context = {
      resetLink: link,
    };

    console.log("Attempting to send email");
    await sendHtmlEmail(email, subject, template, context);
    console.log("Email sent successfully");

    res
      .status(200)
      .json({
        success: true,
        message:
          "Reset link successfully sent, kindly check your email to set a new password",
      });
  } catch (error) {
    console.error("Password reset error:", error);
    handleErrors(error, res);
  }
};

export const getResetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const exisintigUser = await User.findOne({ _id: id });
    if (!exisintigUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists." });
    }
    jwt.verify(token, process.env.SECRET);
    res
      .status(200)
      .json({ success: true, message: "Reset password link is valid." });
  } catch (error) {
    handleErrors(error, res);
  }
};

export const postResetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    const exisintigUser = await User.findOne({ _id: id });
    if (!exisintigUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists." });
    }
    jwt.verify(token, process.env.SECRET);
    const hashPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      {
        $set: {
          password: hashPassword,
        },
      }
    );
    res
      .status(201)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    handleErrors(error, res);
  }
};


export const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    const userId = decoded.id;
    const { currentPassword, newPassword } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User does not exist." });
    }

    const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password." });
    }

    if (!passwordValidator(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashPassword });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error during password change:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing the password.",
    });
  }
};
