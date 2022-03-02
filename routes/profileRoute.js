const express = require('express')
const router = express.Router()
const User = require('../schemas/UserSchema')

router.get('/', (req, res, next) => {
    const payload = {
        pageTitle: 'Profile Page',
        user: req.session.user,
        userInJS: JSON.stringify(req.session.user),
        profileUser: req.session.user,
    }
    return res.status('200').render('profilePage', payload)
})

router.get('/:username', async(req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user)
    return res.status('200').render('profilePage', payload)
})

router.get('/:username/replies', async(req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = 'replies'
    return res.status('200').render('profilePage', payload)
})

router.get('/:username/followers', async(req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = 'followers'
    return res.status('200').render('followingAndFollowers', payload)
})

router.get('/:username/following', async(req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = 'following'
    return res.status('200').render('followingAndFollowers', payload)
})

async function getPayload(username, userLoggedIn) {
    var user = await User.findOne({ username: username })

    if (user == null) {
        user = await User.findById(username)
        if (user == null) {
            return {
                pageTitle: 'User not found',
                user: userLoggedIn,
                userInJS: JSON.stringify(userLoggedIn),
            }
        }
    }

    return {
        pageTitle: user.username,
        user: userLoggedIn,
        userInJS: JSON.stringify(userLoggedIn),
        profileUser: user,
    }
}
module.exports = router