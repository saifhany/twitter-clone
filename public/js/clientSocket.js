let connected = false

const socket = io('http://localhost:3001')

socket.on('connected', () => (connected = true))

socket.emit('setup', user)

socket.on('message recieved', (message) => messageRecieved(message))