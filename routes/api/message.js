const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Message = require('../../schemas/MessageSchema')
const Chat = require('../../schemas/ChatSchema')
const User = require('../../schemas/UserSchema')
const Notification = require('../../schemas/NotificationSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.post('/', (req, res, next) => {
    var data = {
        content: req.body.content,
        chat: req.body.chatId,
        sender: req.session.user._id,
    }

    Message.create(data)
        .then(async(message) => {
            message = await message.populate(['sender'])
            message = await message.populate(['chat'])
            message = await User.populate(message, { path: 'chat.users' })
            Chat.findByIdAndUpdate(req.body.chatId, {
                latestMessage: message,
            }).catch((error) => res.sendStatus(400))

            insertNotifications(message)

            res.status(201).send(message)
        })
        .catch((error) => res.sendStatus(401))
})

function insertNotifications(message) {
    message.chat.users.forEach((user) => {
        if (user._id === message.sender._id) return

        Notification.insertNotification(
            user._id,
            message.sender._id,
            'newMessage',
            message.chat._id
        )
    })
}

module.exports = router