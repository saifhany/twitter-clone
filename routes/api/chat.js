const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Chat = require('../../schemas/ChatSchema')
const User = require('../../schemas/UserSchema')
const Message = require('../../schemas/MessageSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
    Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
        .populate('users')
        .populate('latestMessage')
        .sort({ updatedAt: -1 })
        .then(async(results) => {
            if (req.query.unreadOnly && req.query.unreadOnly == 'true') {
                results = results.filter(
                    (result) =>
                    !result.latestMessage.readBy.includes(req.session.user._id)
                )
            }

            results = await User.populate(results, { path: 'latestMessage.sender' })
            res.status(200).send(results)
        })
        .catch((error) => res.sendStatus(400))
})

router.get('/:chatId', (req, res, next) => {
    Chat.findById(req.params.chatId)
        .populate('users')
        .then((results) => res.status(200).send(results))
        .catch((error) => res.sendStatus(400))
})

router.get('/:chatId/message', (req, res, next) => {
    Message.find({ chat: req.params.chatId })
        .populate('sender')
        .then((results) => res.status(200).send(results))
        .catch((error) => res.sendStatus(400))
})

router.post('/', async(req, res, next) => {
    if (!req.body.users) {
        console.log('Users param not sent with request')
        return res.sendStatus(400)
    }

    // convert string to object
    var users = JSON.parse(req.body.users)

    if (users.length == 0) {
        console.log('Users param not sent with request')
        return res.sendStatus(400)
    }

    users.push(req.session.user)

    var dataChat = {
        users,
        isGroupChat: true,
    }

    Chat.create(dataChat)
        .then((results) => res.status(200).send(results))
        .catch((error) => res.sendStatus(400))
})

router.put('/:chatId', (req, res, next) => {
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
        .then((results) => res.status(204).send(results))
        .catch((error) => res.sendStatus(400))
})

module.exports = router