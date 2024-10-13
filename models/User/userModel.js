import mongoose from "mongoose";
const { Schema } = mongoose

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
    },
    gender: {
      type: String
    },
    stagename: {
      type: String
    },
    musicstyle: {
      type: String
    },
    state: {
      type: String
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    //   validate: [isEmail, 'please enter a valid email']
    },
    password: {
      type: String,
    //   validate: [
    //     passwordValidator,
    //     'Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters'
    //   ]
    },
    // phoneNumber: {
    //   type: Number,
    //   required: [true, 'Please enter your phone number']
    // },
    credits: {
      type: Number,
      default: 500

    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationCode: 
    { type: String },

    twoFASecret: { type: String },
    products: [
      {
        productId: {
          type: String,
          id: mongoose.Types.ObjectId
        },
        productName: {
          type: String
        },
        productCategory: {
          type: String
        }
      }
    ],
    userImage: {
      type: String
    }
  },
  { timestamps: true }
)

export const User = mongoose.model('usermodel', userSchema)

