const path = require('path')
const express = require('express')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/user')

const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0;
// io.on('connection', (socket) => {
    
//     console.log('New websocket connection')
//     socket.emit('countUpdated', count)
//     socket.on('increment', () => {
//         count ++
//         io.emit('countUpdated', count)
//     })
// })
io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if(!user){
            return
        }
        if(filter.isProfane(message)){
            return callback('Profane word is not allowed')
        }
        else{
            
            io.emit('Message', generateMessage(user.username, message))
            callback()
        }
    })


    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        if(!user){
            return
        }
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, coords))
        callback()
    })

    socket.on('join', (options, callback) => {
        //console.log(options)
        if(!options || !options.code || options.code.toLowerCase() !== 'wzs'){
            return callback("Verification Code not right")
        }
        const {error, user} = addUser({id: socket.id, username: options.username, room: options.room});
        //console.log(callback)
        if(error){
            console.log(getUser(socket.id))
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('Message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('Message', generateMessage('Admin', `A new user ${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    socket.on('disconnect', (callback) => {
        const user = removeUser(socket.id)
        if(user){
            console.log(user)
            io.to(user.room).emit('Message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})



