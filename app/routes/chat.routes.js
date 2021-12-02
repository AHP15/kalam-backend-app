import { authJwt } from "../middleware/index.js";
import { addMessage, openChat } from "../controllers/chat.controller.js";

export default function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/add_message", [authJwt.verifyToken], addMessage);
    app.get("/api/get_chat", [authJwt.verifyToken], openChat);
}