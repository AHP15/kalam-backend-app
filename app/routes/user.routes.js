import { authJwt } from '../middleware/index.js';
import { 
    userBoard,
    addContact,
    adminBoard,
    addChat 
} from '../controllers/user.controller.js';

export default function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/add_contact",
        [authJwt.verifyToken],
        addContact
    );
    app.post(
        "/api/add_chat",
        [authJwt.verifyToken],
        addChat
    );

    app.get("/api/user_board", [authJwt.verifyToken], userBoard);
    app.get("/api/admin_board",[
        authJwt.verifyToken,
        authJwt.isAdmin
    ], adminBoard);
}