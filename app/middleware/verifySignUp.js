import DB from '../models/index.js';

const User = DB.user;
const ROLES = DB.ROLES;

const checkForDuplicateEmail = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user =>{
        if(user){
            return res.status(400).send({message: "Failed!!, email alraedy in use"});
        }
        next();
    })
    .catch(err => {
        return res.status(500).send({message: err});
    });
}

const checkRoleExisted = (req, res, next) => {
    let reqRoles = req.body.roles;
    if(reqRoles){
        for(let role of reqRoles){
            if(!ROLES.includes(role)){
                return res.status(404).send({message:`Failed!!, role ${role} does not exist!!`});
            }
        }
    }
    next();
}

export {checkForDuplicateEmail, checkRoleExisted};