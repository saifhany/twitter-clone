const express = require('express')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')
const Post = require('../../schemas/PostSchema')
const User = require('../../schemas/UserSchema')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', async(req, res, next) => {
    var searchObj = req.query

    if (searchObj.isReply !== undefined) {
        var isReply = searchObj.isReply == 'true'
        searchObj.replyTo = { $exists: isReply }
        delete searchObj.isReply
            // { postedBy: '61dfd49369b8b37f05dd5098', replyTo: { '$exists': false } }
    }

    if (searchObj.followingOnly !== undefined) {
        var followingOnly = searchObj.followingOnly == 'true'
        if (followingOnly) {
            // show posts from people we're following and from user loggedin
            var objectsId = []
            if (!req.session.user.following) {
                req.session.user.following = []
            }
            req.session.user.following.forEach((user) => objectsId.push(user))
            objectsId.push(req.session.user._id)
            searchObj.postedBy = { $in: objectsId }
        }
        delete searchObj.followingOnly
    }

    var results = await getPosts(searchObj)
    res.status(200).send(results)
})

router.get('/:id', async(req, res, next) => {
    var postId = req.params.id

    var postData = await getPosts({ _id: postId })
    postData = postData[0]

    var result = {
        postData: postData,
    }

    if (postData.replyTo) {
        result.replyTo = postData.replyTo
    }

    result.replies = await getPosts({ replyTo: postId })

    res.status(200).send(result)
})

router.delete('/:id', (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
        .then(() => res.sendStatus(202))
        .catch((error) => res.sendStatus(400))
})

router.post('/', async(req, res, next) => {
    if (!req.body.content) {
        return res.sendStatus(400)
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user,
    }

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo
    }

    Post.create(postData)
        .then(async(newPost) => {
            newPost = await User.populate(newPost, { path: 'postedBy' })
            res.status(201).send(newPost)
        })
        .catch((error) => res.sendStatus(400))
})

router.put('/:id/like', async(req, res, next) => {
    var postId = req.params.id
    var userId = req.session.user._id

    var isLiked =
        req.session.user.likes && req.session.user.likes.includes(postId)

    var option = isLiked ? '$pull' : '$addToSet'

    req.session.user = await User.findByIdAndUpdate(
        userId, {
            [option]: { likes: postId },
        }, { new: true }
    ).catch((error) => res.sendStatus(400))

    var post = await Post.findByIdAndUpdate(
        postId, {
            [option]: { likes: userId },
        }, { new: true }
    ).catch((error) => res.sendStatus(400))

    res.status(200).send(post)
})

router.post('/:id/retweet', async(req, res, next) => {
    var postId = req.params.id
    var userId = req.session.user._id

    // Unretweet
    var unretweet = await Post.findOneAndDelete({
        postedBy: userId,
        retweetData: postId,
    }).catch((error) => res.sendStatus(400))

    var option = unretweet != null ? '$pull' : '$addToSet'

    var repost = unretweet

    if (repost === null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
            (error) => res.sendStatus(400)
        )
    }

    req.session.user = await User.findByIdAndUpdate(
        userId, {
            [option]: { retweets: postId },
        }, { new: true }
    ).catch((error) => res.sendStatus(400))

    var post = await Post.findByIdAndUpdate(
        postId, {
            [option]: { retweetUsers: userId },
        }, { new: true }
    ).catch((error) => res.sendStatus(400))

    res.status(200).send(post)
})

async function getPosts(filter) {
    var results = await Post.find(filter)
        .populate('postedBy')
        .populate('retweetData')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .catch((error) => res.sendStatus(400))

    var results = await User.populate(results, { path: 'replyTo.postedBy' })
    return await User.populate(results, { path: 'retweetData.postedBy' })
}

module.exports = router