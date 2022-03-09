const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Message = require('../../schemas/MessageSchema')
const Chat = require('../../schemas/ChatSchema')

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
            Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message }).catch(
                (error) => res.sendStatus(400)
            )

            res.status(201).send(message)
        })
        .catch((error) => res.sendStatus(401))
})

module.exports = router