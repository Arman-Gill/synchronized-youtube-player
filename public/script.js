var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    
    
    playerVars: {
    'playsinline': 1,
    'controls' : 0,
    'disablekb' : 1, 
    'enablejsapi':1,
    'rel':0,
    'modestBranding':1
    },
    events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
    }
});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
//event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
if (event.data == YT.PlayerState.PLAYING && !done) {
    //setTimeout(stopVideo, 100000);
    done = true;
}
}
function stopVideo() {
player.stopVideo();
}


const youtubeLink = document.querySelector('[data-youtube-link-submit-button]')
youtubeLink.addEventListener('click', e=>{
  e.preventDefault()

})

const loadingDiv= document.createElement('div')
loadingDiv.innerHTML = 'Loading...'
loadingDiv.setAttribute('class', 'loading')
document.body.appendChild(loadingDiv)


function main(){
  loadingDiv.remove()
  console.log('loaded')
  
  const socket = io('http://localhost:3000')

  let videoDuration

  const seekBar = document.getElementById('seekBar')
  const seekBarBox = document.getElementById('seekBarBox')
  const youtubeLink = document.querySelector('[data-youtube-link]')
  const youtubeLinkSubmitButton = document.querySelector('[data-youtube-link-submit-button]')
  const playButton = document.querySelector('[data-play-button]')
  const pauseButton = document.querySelector('[data-pause-button]')
  const seekBarLength = 536;

  function seekTo(SecondsToSeekTo){
    const percentWatched = (SecondsToSeekTo/videoDuration)*100
    const percentWatchedString = percentWatched.toString()
    seekBarBox.style.setProperty('--left', percentWatchedString)
    player.seekTo(SecondsToSeekTo, true)
  }

  function changeVideo(videoId){
    player.loadVideoById(videoId)
  }

  function extractVideoId(){
    const videoId = youtubeLink.value
    socket.emit('change-video-request', videoId)
  }


  function moveSeekBarOnClick(e){
    const percentageOfClicked = (e.offsetX/seekBarLength)*100
    videoDuration = player.getDuration()
    const secondsToSeekTo = (percentageOfClicked/100) * videoDuration
    console.log(seekTo)
    socket.emit('seekTo-request', secondsToSeekTo)
  }

  // moving the seekbar
  setInterval(()=>{
    if(player.getPlayerState() == 1){
      videoDuration = player.getDuration()
      const currentTime = player.getCurrentTime()
      const percentWatched = (currentTime/videoDuration)*100
      const percentWatchedString = percentWatched.toString()
      seekBarBox.style.setProperty('--left', percentWatchedString)
    }
  },200)

  youtubeLinkSubmitButton.addEventListener('click', extractVideoId)
  //moving the seekbar on clicking
  seekBar.addEventListener('click', e=>moveSeekBarOnClick(e))

  playButton.addEventListener('click', ()=>{
    socket.emit('status-change-request', 'play')
  })

  pauseButton.addEventListener('click', ()=>{
    socket.emit('status-change-request', 'pause')
  })


  //socket code
  socket.on('status-change', data =>{
    if(data == 'play'){
      player.playVideo();
    }
    else if(data == 'pause'){
      player.pauseVideo()
      
    }
  })

  socket.on('change-video', videoId=>changeVideo(videoId))

  socket.on('seekTo', secondsToSeekTo => seekTo(secondsToSeekTo))

  socket.on('sync-request', (userId)=>{
    console.log(userId)
    socket.emit('sync-request-params', player.getCurrentTime())
  })

  socket.on('sync-now', secondsToSeekTo => seekTo(secondsToSeekTo))

}

setTimeout(main, 10000)


