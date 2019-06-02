const users = []

const addUser = ({id, username, room}) => {
    //Clean data
    username = username.trim().toLowerCase()
    room  = room.trim().toLowerCase()

    //
    if (!username || !room) {
        return {
            error: 'username and room are required',
        }
    }

    //Check for existing
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //
    if(existingUser){
        return{
            error: 'username is in use'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user };
}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
getUser = (id) => {
    return users.find((user) => {
        return user.id === id;
    })
}
getUsersInRoom = (room) => {
    return  users.filter((user)=>{
        return user.room === room
    })
}

// addUser({
//     id: 22,
//     username: 'Andrew',
//     room: "room1"
// })
// addUser({
//     id: 42,
//     username: 'Mike',
//     room: "room1"
// })
// addUser({
//     id: 32,
//     username: 'Andrew',
//     room: "room2"
// })

// console.log(users)

// const usersinroom = getUsersInRoom('room1')
// console.log(usersinroom)
// console.log(getUser(22))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}