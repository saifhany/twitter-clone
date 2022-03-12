const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const User = require('../../schemas/UserSchema')
const Notification = require('../../schemas/NotificationSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', async(req, res, next) => {
    var searchObj = req.query

    if (req.query.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { username: { $regex: req.query.search, $options: 'i' } },
            ],
        }
    }

    User.find(searchObj)
        .then((results) => res.status(200).send(results))
        .catch((error) => res.sendStatus(404))
})
router.put('/:id/follow', async(req, res, next) => {
    var userId = req.params.id
    var user = await User.findById(userId)

    if (user === null) return res.sendStatus(404)

    var isFollowing =
        user.followers && user.followers.includes(req.session.user._id)

    var option = isFollowing ? '$pull' : '$addToSet'

    req.session.user = await User.findByIdAndUpdate(
        req.session.user._id, {
            [option]: { following: userId },
        }, { new: true }
    ).catch((error) => res.sendStatus(400))

    User.findByIdAndUpdate(userId, {
        [option]: { followers: req.session.user._id },
    }).catch((error) => res.sendStatus(400))

    if (!isFollowing) {
        await Notification.insertNotification(
            userId,
            req.session.user._id,
            'follow',
            req.session.user._id
        )
    }

    res.status(200).send(req.session.user)
})

router.get('/:id/followers', async(req, res, next) => {
    User.findById(req.params.id)
        .populate('followers')
        .then((results) => {
            res.status(200).send(results.followers)
        })
        .catch((error) => res.sendStatus(400))
})

router.get('/:id/following', async(req, res, next) => {
    User.findById(req.params.id)
        .populate('following')
        .then((results) => {
            res.status(200).send(results.following)
        })
        .catch((error) => res.sendStatus(400))
})

router.post(
    '/profilePicture',
    upload.single('croppedImage'),
    async(req, res, next) => {
        if (!req.file) {
            return res.sendStatus(400)
        }

        var filePath = `/uploads/images/${req.file.filename}.png`
        var tempPath = req.file.path
        var targetPath = path.join(__dirname, `../../${filePath}`)

        fs.rename(tempPath, targetPath, async(error) => {
            if (error != null) {
                return res.sendStatus(400)
            }

            req.session.user = await User.findByIdAndUpdate(
                req.session.user._id, {
                    profilePic: filePath,
                }, { new: true }
            )

            res.sendStatus(200)
        })
    }
)

router.post(
    '/coverPhoto',
    upload.single('croppedImage'),
    async(req, res, next) => {
        if (!req.file) {
            return res.sendStatus(400)
        }

        var filePath = `/uploads/images/${req.file.filename}.png`
        var tempPath = req.file.path
        var targetPath = path.join(__dirname, `../../${filePath}`)

        fs.rename(tempPath, targetPath, async(error) => {
            if (error != null) {
                return res.sendStatus(400)
            }

            req.session.user = await User.findByIdAndUpdate(
                req.session.user._id, {
                    coverPhoto: filePath,
                }, { new: true }
            )

            res.sendStatus(200)
        })
    }
)

module.exports = router