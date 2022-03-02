const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Chat = require('../schemas/ChatSchema')
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {
    const payload = createPayload(req.session.user, 'Inbox')
    return res.status('200').render('inboxPage', payload)
})

router.get('/new', (req, res, next) => {
    const payload = createPayload(req.session.user, 'New Message')
    return res.status('200').render('newInboxPage', payload)
})

router.get('/:chatId', async(req, res, next) => {
    var userId = req.session.user._id
    var chatId = req.params.chatId
    var isValidId = mongoose.isValidObjectId(chatId)

    var payload = createPayload(req.session.user, 'Chat')

    if (!isValidId) {
        payload.errorMessage =
            'Chat does not exist or you do not have permission to view it.'
        return res.status(400).render('chatPage', payload)
    }

    var chat = await Chat.findOne({
        _id: chatId,
        users: { $elemMatch: { $eq: userId } },
    })

    if (chat == null) {
        // private message. chatId adalah userId
        var userFound = await User.findById(chatId)

        if (userFound != null) {
            chat = await getChatByUserId(userId, userFound._id)
        } else {
            payload.errorMessage =
                'Chat does not exist or you do not have permission to view it.'
        }
    }
    payload.chat = chat

    return res.status('200').render('chatPage', payload)
})

function getChatByUserId(userLoggedInId, otherUserId) {
    // mencari chat: isGroupChat bernilai false dan users yang mempunyai 2 value (userLoggedIn, otherUserId)
    // jika doc tidak ditemukan, mk akan dibuatkan doc baru di mana users nya berisi (userLoggedInId, otherUserId)

    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
            ],
        },
    }, {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId],
        },
    }, {
        new: true,
        upsert: true,
    })
}

function createPayload(userLoggedIn, title) {
    return {
        pageTitle: title,
        user: userLoggedIn,
        userInJS: JSON.stringify(userLoggedIn),
    }
}
module.exports = router