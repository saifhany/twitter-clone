const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Chat = require('../../schemas/ChatSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', async(req, res, next) => {
    Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
        .populate('users')
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

module.exports = router