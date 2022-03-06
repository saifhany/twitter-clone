const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Message = require('../../schemas/MessageSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.post('/', (req, res, next) => {
    var data = {
        content: req.body.content,
        chat: req.body.chatId,
        sender: req.session.user._id,
    }

    Message.create(data)
        .then((message) => res.status(201).send(message))
        .catch((error) => res.sendStatus(401))
})

module.exports = router