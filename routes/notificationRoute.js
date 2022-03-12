const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
    const payload = {
        pageTitle: 'Notifications',
        user: req.session.user,
        userInJS: JSON.stringify(req.session.user),
    }
    return res.status('200').render('notificationPage', payload)
})
module.exports = router