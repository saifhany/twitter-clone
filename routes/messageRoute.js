const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
    const payload = createPayload(req.session.user, 'Inbox')
    return res.status('200').render('inboxPage', payload)
})

router.get('/new', (req, res, next) => {
    const payload = createPayload(req.session.user, 'New Message')
    return res.status('200').render('newInboxPage', payload)
})

function createPayload(userLoggedIn, title) {
    return {
        pageTitle: title,
        user: userLoggedIn,
        userInJS: JSON.stringify(userLoggedIn),
    }
}
module.exports = router