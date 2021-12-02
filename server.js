import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import DB from './app/models/index.js';
import authentication from './app/routes/auth.routes.js';
import authorization from './app/routes/user.routes.js';
import chat from './app/routes/chat.routes.js';

dotenv.config();

const APP = express();
let corsOptions = {
    origin:["https://kalam-a272c.web.app/","http://localhost:3000"],
};

APP.use(cors(corsOptions));
// parse request with content-type "application/json"
APP.use(bodyParser.json());
// parse request with content-type "application/x-www-form-urlencoded"
APP.use(bodyParser.urlencoded({extended: true}));

//connect to the database
const Role = DB.role;
DB.mongoose.connect(process.env.CONNECTION_URL)
.then(() => {
    console.log("Connecting to the DB seccussfully!!");
    initial();
})
.catch(err => {
    console.log("Error while connecting to the db", err);
    process.exit();
});

function initial(){
    Role.estimatedDocumentCount()
    .then(count => {
        if(count === 0){
            new Role({
                name: "user"
            })
            .save((err) =>{
                if(err){
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection!!");
            });

            new Role({
                name: "admin"
            })
            .save((err) =>{
                if(err){
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection!!");
            });
        }
    })
    .catch(err => {
        console.log("error", err);
    });
}

APP.get("/", (req, res) => {
    res.status(200).json({message: "Hello from chat app"});
});

authentication(APP);
authorization(APP);
chat(APP);

const port = process.env.PORT ?? 8080;

APP.listen(port, () => {
    console.log(`listening on port ${port}`);
});