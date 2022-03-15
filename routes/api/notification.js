const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Notification = require('../../schemas/NotificationSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
    var searchObj = {
        userTo: req.session.user._id,
        type: { $ne: 'newMessage' },
    }

    if (req.query.unreadOnly && req.query.unreadOnly == 'true') {
        searchObj.opened = false
    }

    Notification.find(searchObj)
        .populate('userTo')
        .populate('userFrom')
        .sort({ createdAt: -1 })
        .then((results) => res.status(200).send(results))
        .catch((error) => res.sendStatus(400))
})

router.put('/:id/markAsOpen', (req, res, next) => {
    Notification.findByIdAndUpdate(req.params.id, { opened: true })
        .then(() => res.sendStatus(204))
        .catch((error) => res.sendStatus(400))
})

router.put('/markAsOpen', (req, res, next) => {
    Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
        .then(() => res.sendStatus(204))
        .catch((error) => res.sendStatus(400))
})

module.exports = router