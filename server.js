const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const port = process.env.PORT || 3000

server.listen(port)

app.set('views', 'views')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('public'))


app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/ViewVideo.html')
})

io.on('connection', socket =>{
    console.log('new user joined')
    io.emit('sync-request', socket.id)

    socket.on('sync-request-params', currentPlayTime =>{
        io.emit('sync-now', currentPlayTime) 
    })

    socket.on('status-change-request', data =>{
        console.log('its working')
        io.emit('status-change', data)
    })

    socket.on('seekTo-request', secondsToSeekTo =>{
        io.emit('seekTo', secondsToSeekTo)
    })

    socket.on('change-video-request', videoId =>{
        io.emit('change-video', videoId)
    })

    

})