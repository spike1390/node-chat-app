const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#message")

//template
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#locationMessage-template").innerHTML
const sidebarTemplate = document.querySelector("#sider-template").innerHTML

//Options
const {username, room, code} = Qs.parse(location.search, {ignoreQueryPrefix: true })



console.log(username, room, code)
socket.emit('join', {username, room, code}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild
    
    //get height
    const newMessaageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessaageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight


    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socket.on('Message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users        
    })
    document.querySelector("#sidebar").innerHTML = html
})

socket.on('locationMessage', (message) => {
    console.log(message)    
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) =>{
    e.preventDefault()

    const message = e.target.elements.message.value
    if(!message){
        alert("cant send empty message")
        return
    }
    
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')
    socket.emit("sendMessage", message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            console.log(error)
        }else{
            console.log('The message was deliveried')
        }
    })
    
})

document.querySelector("#send-location").addEventListener('click', () => {
    $locationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        return alert('geoloacation not support')
    }

    navigator.geolocation.getCurrentPosition((postion)=>{
        //console.log(postion)
        //enable
        $locationButton.removeAttribute('disabled')
        socket.emit("sendLocation", {
            longitude: postion.coords.longitude,
            latitude: postion.coords.latitude,
        },
        () => {
            console.log('Location shared!')
        })
    })
})

// socket.on('countUpdated', (count) => {
//     console.log('the count has updated' + count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })