import mongoose from "mongoose";

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username:String,
        email:String,
        password:String,
        contacts:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        roles:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]
    })
);

export default User;