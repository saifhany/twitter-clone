const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const User = require('../schemas/UserSchema')

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res, next) => {
    const payload = {
        title: 'Login',
    }
    return res.status('200').render('login', payload)
})

router.post('/', async(req, res, next) => {
    var username = req.body.logUsername
    var password = req.body.logPassword

    var payload = req.body

    if (username && password) {
        var user = await User.findOne({
            $or: [
                { email: req.body.logUsername },
                { username: req.body.logUsername },
            ],
        }).catch((error) => {
            payload.errorMessage = 'Something went wrong.'
            res.status(200).render('login', payload)
        })

        if (user != null) {
            var result = await bcrypt.compare(password, user.password)

            if (result === true) {
                req.session.user = user
                return res.redirect('/')
            }
        } else {
            payload.errorMessage = 'Login credentials incorrect.'
            res.status(200).render('login', payload)
        }
    }
    payload.errorMessage = 'Make sure each field has a valid value'
    res.status(200).render('login', payload)
})

module.exports = router