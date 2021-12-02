import mongoose from "mongoose";

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        name:String,
        users:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }]
    })
);

export default Chat;