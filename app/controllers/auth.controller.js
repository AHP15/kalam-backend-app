import DB from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import wait from '../utils/wait.js';

const User = DB.user;
const Role = DB.role;
const RefreshToken = DB.refreshToken;

const signup = (req, res) => {

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    newUser.save()
    .then(user => {
        if(req.body.roles){//if the roles was specified from the client
            return Role.find({ name: {$in: req.body.roles}});
        }else{// else we give the new user a role of "user"
            return Role.findOne({ name : "user"});
        }
    })
    .then(newRoles => {
        
        if(req.body.roles){//the roles was specified from the client
            newUser.roles = newRoles.map(role => role._id);
        }else{
            newUser.roles = [newRoles._id];
        }
        return  newUser.save();
    })
    .then(() => {
        return res.status(201).send({message: "User was registered successfully!"});
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err});
    })
}

const signin = (req, res) => {
    
    User.findOne({email: req.body.email}).populate("roles", "-__v")
    // handling random database request failure !!
    // assuming that the failures are random this simple trick
    // should reduce code's error rate from 1% to .01
    .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
        return User.findOne({email: req.body.email}).populate("roles", "-__v")
    }))
    .then(async user => {
        if(!user){
            return res.status(404).send({message: "User not found !!"});
        }
        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        
        if(!passwordIsValid){
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!!"
            });
        }

        // create a token
        const token = jwt.sign({id: user.id}, process.env.SECRET, {
            expiresIn: parseInt(process.env.jwtExpiration)
        });

        let _refreshToken = await RefreshToken.findOne({user: user._id});

        if(_refreshToken){// if there is a refreshToken in DB get it
            _refreshToken = _refreshToken.token;
        }else{// else create new one
            _refreshToken = await RefreshToken.createToken(user);
        }
        
        let authorities = user.roles?.map( role => `ROLE_${role.name.toUpperCase()}`);

        return res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
            refreshToken: _refreshToken,
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err});
    });
}

const refreshToken = (req, res) => {
    const  _requestToken = req.body.requestToken; 

    if(_requestToken === null){
        return res.status(403).send({message: "Refresh Token is required!"});
    }
    
    //look for the refresh token in the DB
    RefreshToken.findOne({ token: _requestToken })
    .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
        return RefreshToken.findOne({ token: _requestToken });
    }))
    .then(_refreshToken => {
        // verify if it exist in teh DB
        if(!_refreshToken){
            return res.status(403).json({ message:"Refresh token is not in database!"});
        }

        // verify if it is not expired yet
        if (RefreshToken.verifyExpiration(_refreshToken)) {
            RefreshToken.findByIdAndRemove(_refreshToken._id, { useFindAndModify: false }).exec();
            
            return res.status(403).json({
              message: "Refresh token was expired. Please make a new signin request",
            });
        }

        // the refresh token is valid so create a new token
        let newAccessToken = jwt.sign(
            { id: _refreshToken.user._id}
            , process.env.SECRET, 
            {expiresIn: parseInt(process.env.jwtExpiration)}
        );

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: _refreshToken.token,
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err});
    });
}

export { signup, signin , refreshToken};