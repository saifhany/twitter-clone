const express = require('express')
const router = express.Router()

router.get('/:id', (req, res, next) => {
    const payload = {
        pageTitle: 'View post',
        user: req.session.user,
        userInJS: JSON.stringify(req.session.user),
        postId: req.params.id,
    }
    return res.status('200').render('postPage', payload)
})
module.exports = router