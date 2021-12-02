import mongoose from "mongoose";
import User from "./user.model.js";
import Role from "./role.model.js";
import Chat from './chat.model.js';
import Message from "./message.model.js";
import RefreshToken from "./refreshToken.model.js";

const DB = {
    mongoose: mongoose,
    role: Role,
    user: User,
    chat: Chat,
    message: Message,
    refreshToken:RefreshToken,
    ROLES: ["user", "admin"],
};

export default DB;