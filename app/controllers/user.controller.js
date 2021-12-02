import DB from '../models/index.js';
import wait from '../utils/wait.js';

const User = DB.user;
const Chat = DB.chat;

const userBoard = (req, res) => {
    let id = req.userId;
    let data = {
        contacts:null,
        chats:null,
    };

    User.findById(id)
    .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
        return User.findById(id);
    }))
    .then(user => {
        return User.find({ _id: {$in: user.contacts}});
    })
    .then(_contacts => {
        data.contacts = _contacts.map(contact => {
            return {
                id: contact._id,
                username: contact.username,
                email: contact.email
            }
        });
        return Chat.find({ users: {$in: id}})
            .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
                return Chat.find({ users: {$in: id}});
            }));
    })
    .then(_chats => {
        data.chats = _chats.map(chat => {
            return {
                id: chat._id,
                name: chat.name
            }
        });

        return res.status(200).send(data);
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err.message});
    });
}

const addContact = (req, res) => {
    const _contactEmail = req.body.contactEmail;
    const userId = req.userId;

    User.findOne({email: _contactEmail})
    // handling random database request failure !!
    // assuming that the failures are random this simple trick
    // should reduce code's error rate from 1% to .01
    .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
        return User.findOne({email: _contactEmail});
    }))
    .then(async contact => {
        if(!contact){
            /*
            return res.status(404).send({
                message: `user with email ${_contactEmail} does not exist`
            });
            */
           throw new Error( `user with email ${_contactEmail} does not exist`);
        }

        return {
            contact,
            user: await User.findById(userId)
        };
    })
    .then(({contact, user}) => {
        user.contacts = [...user.contacts, contact._id];
        return {
            contact,
            save: user.save()// save the change in the database
        };
    })
    .then(({contact}) => {
        return res.status(201).send({
            id: contact._id,
            username:contact.username,
            email:contact.email,
            message: "contact added !!"
        });
    })
    .catch(err => {
        return res.status(500).send({message: err.message});
    });
}


const addChat = (req, res) => {
    let _chatUsers = req.body.chatUsers;
    let _name= req.body.name;

    // create new chat
    let newChat = new Chat({
        name: _name,
    })

    newChat.save()
    .then(() => {
        return User.find({email: {$in: _chatUsers}});
    })
    .then(users => {
        newChat.users = [...users.map(user => user._id), req.userId];
        return newChat.save();
    })
    .then(() => {
        return res.status(201).send({
            id: newChat._id,
            name: newChat.name,
            message: "chat added successfully!",
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err.message});
    });
}


const adminBoard = (req, res) => {
    return res.status(200).send({message: "Nothing interesting for now"});
}

export { userBoard, addContact, adminBoard, addChat };