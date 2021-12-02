import DB from '../models/index.js';
import wait from '../utils/wait.js';
const Chat = DB.chat;
const Message = DB.message;

const openChat = (req, res) => {

    const chatId = req.headers["id"];
    Chat.findById(chatId)
    .populate({
        path:"messages",
        populate: { path: 'user' }
    })
    .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
        return Chat.findById(chatId).populate({
            path:"messages",
            populate: { path: 'user' }
        });
    }))
    .then(chat => {
        if(!chat){
            throw new Error(`chat with id ${chatId} does not exist !!`);
        }
        let messages = chat.messages?.map(message =>{
            return {
                id: message.id,
                content: message.content,
                user: message.user.username,
                date: message.date,
            }
        });

        return res.status(200).send({message: messages});
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({message: err.message});
    });
}

const addMessage = (req, res) => {
    let { _content, _userId, _chatId } = req.body;

    let message = new Message({
        content:_content,
        user:_userId,
        chat:_chatId,
    });

    message.save()
    .then(() => {
        return Chat.findById(_chatId)
            .catch(e => wait(500).then(() => { //On failure, wait 500ms and retry
               return Chat.findById(_chatId)
            }));
    })
    .then(chat => {
        chat.messages = [...chat.messages, message._id];
        return chat.save();
    })
    .then(() => {
        return res.status(201).send({message: message});
    })
    .catch(err => {
        return res.status(500).send({message: err.message});
    })
}

export { openChat, addMessage };