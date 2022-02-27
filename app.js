const express = require('express')
const app = express()
const port = 3001
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const database = require('./database')
const session = require('express-session')

const server = app.listen(port, () =>
    console.log('Server listening on port ' + port)
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(
    session({
        secret: 'choi ung',
        resave: true,
        saveUninitialized: false,
    })
)

app.set('view engine', 'pug')
app.set('views', 'views')

// Routes
const loginRoute = require('./routes/loginRoute')
const logoutRoute = require('./routes/logoutRoute')
const registerRoute = require('./routes/registerRoute')
const postRoute = require('./routes/postRoute')
const profileRoute = require('./routes/profileRoute')
const uploadRoute = require('./routes/uploadRoute')
const searchRoute = require('./routes/searchRoute')
const messageRoute = require('./routes/messageRoute')

app.use('/login', loginRoute)
app.use('/logout', logoutRoute)
app.use('/register', registerRoute)
app.use('/post', middleware.requireLogin, postRoute)
app.use('/profile', middleware.requireLogin, profileRoute)
app.use('/uploads', uploadRoute)
app.use('/search', middleware.requireLogin, searchRoute)
app.use('/message', middleware.requireLogin, messageRoute)

// Api Routes
const postApiRoute = require('./routes/api/post')
const userApiRoute = require('./routes/api/user')
const chatApiRoute = require('./routes/api/chat')

app.use('/api/post', postApiRoute)
app.use('/api/user', userApiRoute)
app.use('/api/chat', chatApiRoute)

app.get('/', middleware.requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: 'Home',
        user: req.session.user,
        userInJS: JSON.stringify(req.session.user),
    }
    res.status('200').render('home', payload)
})