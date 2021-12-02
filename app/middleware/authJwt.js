import jwt from 'jsonwebtoken';
import DB from '../models/index.js';

const User = DB.user;
const Role = DB.role;

const { TokenExpiredError } = jwt;
const catchError = (err, res) => {
    if(err instanceof TokenExpiredError){
        return res.status(401).send({message: "Unauthorized! Access Token was expired!"});
    }

    return res.status(401).send({message: "Unauthorized!"});
}

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).send({message: "No token is provided!!"});
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err){
            return catchError(err, res);
        }

        req.userId = decoded.id;
        next();
    });
}

const isAdmin = (req, res, next) => {
    //userId from the token
    User.findById(req.userId)
    .then(user => {
        return Role.find({_id : {$in:user.roles}});
    })
    .then(roles => {
        for(let role of roles){
            if(role === "admin"){
                next();
                return;
            }
        }

        return res.status(403).send({ message: "Require Admin Role!" });
    })
    .catch(err => {
        return res.status(500).send({message:err});
    })
}

export { verifyToken, isAdmin };