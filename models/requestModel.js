import mongoose from "mongoose";
const { Schema } = mongoose

const requestModel = new mongoose.Schema({
    price: {
        type: String,
        required: [true, 'kindly enter the price']
      },
      genre: {
        type: String,
        required: [true, 'kindly enter your genre']
      },
      description: {
        type: String,
        
        required: [true, 'describe this sound'],
      },


})

export const Request = mongoose.model('requestmodel', songModel)