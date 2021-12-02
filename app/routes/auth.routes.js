import { authJwt, verifySignUp} from "../middleware/index.js";
import { signup, signin, refreshToken } from "../controllers/auth.controller.js";

export default function(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
          verifySignUp.checkForDuplicateEmail,
          verifySignUp.checkRoleExisted
        ],
        signup
    );
    app.post("/api/auth/signin", signin);
    app.post("/api/auth/refresh_token", refreshToken);
}