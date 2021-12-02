import { verifyToken, isAdmin } from "./authJwt.js";
import {checkForDuplicateEmail, checkRoleExisted} from './verifySignUp.js';

const authJwt = {
    verifyToken,
    isAdmin,
}

const verifySignUp = {
    checkRoleExisted,
    checkForDuplicateEmail
}

export { authJwt, verifySignUp};