let connected = false

const socket = io('http://localhost:3001')

socket.on('connected', () => (connected = true))

socket.emit('setup', user)

socket.on('message recieved', (message) => messageRecieved(message))

socket.on('notification received', () => {
    $.get('/api/notification/latest', (data) => notificationReceived(data))
})

const emitNotification = (userId) => {
    if (userId == user._id) return

    socket.emit('notification received', userId)
}