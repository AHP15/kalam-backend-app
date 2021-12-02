import mongoose from 'mongoose';

const Message = mongoose.model(
    "Message",
    new mongoose.Schema({
        content: String,
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        chat:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        date: Date,
    })
);

export default Message;