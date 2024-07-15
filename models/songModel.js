import mongoose from "mongoose";
const { Schema } = mongoose

const songModel = new mongoose.Schema({
    songtitle: {
        type: String,
        required: [true, 'kindly enter your song title here']
      },
      stagename: {
        type: String,
        required: [true, 'kindly enter your stage name']
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

export const Song = mongoose.model('songmodel', songModel)