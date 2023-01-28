import {parseGIF, decompressFrames} from 'gifuct-js'

var loadedFrames
var frameIndex

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const ctx = canvas.getContext('2d')
var gifCanvas = document.createElement('canvas')
document.body.appendChild(gifCanvas)
var gifCtx = gifCanvas.getContext('2d')
var tempCanvas = document.createElement('canvas')
document.body.appendChild(tempCanvas)

var tempCtx = tempCanvas.getContext('2d')
let playing = false;

let gifFPS = 0;

const playBtn = document.createElement('button')
const pauseBtn = document.createElement('button')
playBtn.onclick = () => {
    playpause()
}
playBtn.innerHTML = '播放'
pauseBtn.innerHTML = '暂停'
document.body.appendChild(playBtn)
document.body.appendChild(pauseBtn)
let duration = 0;
let playBackRate = 1;
let seek = 1000;
let delay = 0;
let startTime = 0;
let thisCurrentFrame = 0;
let startDelayTime = 0;
let validFrames = [];
fetch('./horses.gif').then(res => res.arrayBuffer()).then(async (buffer) => {
    const res = parseGIF(buffer)
    console.log(res);
    validFrames = res.frames.filter(frame => frame.gce);
    delay = Math.floor( validFrames.reduce((prev, cur) => {
        return prev + cur.gce.delay * 10
    },0) / validFrames.length);
    // const sum = res.frames.reduce((prev,cur) => {
    //     if(cur.image) {
    //         return prev+cur.image.data.blocks.byteLength
    //     }
    //     return prev
    // }, 0)
    const frames = decompressFrames(res, true)


    let validFrameSum = 0
    duration = validFrames.reduce((prev, cur) => prev + (cur.gce.delay || 10) * 10 ,0)
    gifFPS = 1000 / delay;
    console.log(frames, delay, duration)

    console.log(gifFPS, duration, validFrameSum)
    // console.log(frameData, new Uint8ClampedArray(frameData.pixels))
    // const imagedata = new ImageData(new Uint8ClampedArray(frameData.pixels), frameData.dims.width / 2,frameData.dims.height /2);
    // console.log(imagedata,sum,frameData.pixels, frameData, buffer.byteLength, buffer.byteLength - sum)
    // const bitmap = await createImageBitmap(imagedata)

    renderGIF(frames)
})
var frameImageData
var needsDisposal = false

function renderFrame() {    


//   var end = new Date().getTime()
//   var diff = end - start

  if (playing) {
    // delay the next gif frame
    // setTimeout(function() {

    requestAnimationFrame(renderFrame)
      //renderFrame();
    //   console.error(diff, frame.delay, Math.max(0, Math.floor(frame.delay - diff)))
    // }, Math.max(0, Math.floor(26 - diff)))
  }
  renderNextFrame()

}

let startPosition = 0;
window.handleBlockMouseDown = function(e) {
    console.log(e.offsetX)
    const seekPercentage = e.offsetX / e.target.offsetWidth;
    frameIndex = Math.floor(seekPercentage * validFrames.length)
    startPosition = e.offsetX
    // needsDisposal = true;
    renderNextFrame()
}

function renderNextFrame() {
    const playTime = performance.now() - startTime;
    const currentFrame = Math.floor((playTime / 1000) * gifFPS);
    console.log(thisCurrentFrame, currentFrame)
    if (thisCurrentFrame === currentFrame) return;

    thisCurrentFrame = currentFrame;

     // get the frame
  var frame = loadedFrames[frameIndex]

//   var start = new Date().getTime()
  
  if (needsDisposal) {
    gifCtx.clearRect(0, 0, canvas.width, canvas.height)
    needsDisposal = false
  }

  // draw the patch
  drawPatch(frame)

  // perform manipulation
  manipulate()

  startDelayTime += frame.delay
  // update the frame index
  frameIndex++
  if (frameIndex >= loadedFrames.length) {
    frameIndex = 0
  }
  
  if (frame.disposalType === 2) {
    needsDisposal = true
  }
  updateProgress()
}
function updateProgress() {
    console.log(startDelayTime , duration)
    const block = document.getElementById('progressBlock')
    block.style.left = 100 * startDelayTime / duration + '%'
    if(startDelayTime === duration) {
        startDelayTime = 0
    }
    return startDelayTime / duration
}
function manipulate() {
    var imageData = gifCtx.getImageData(0, 0, gifCanvas.width, gifCanvas.height)
  
    // do pixelation
    var pixelsX = 5 + Math.floor(canvas.width - 5)
    var pixelsY = (pixelsX * canvas.height) / canvas.width
  
    ctx.putImageData(imageData, 0, 0)
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, pixelsX, pixelsY)
    ctx.drawImage(canvas, 0, 0, pixelsX, pixelsY, 0, 0, canvas.width, canvas.height)
  }
  
function drawPatch(frame) {
  var dims = frame. dims

  if (
    !frameImageData ||
    dims.width != frameImageData.width ||
    dims.height != frameImageData.height
  ) {
    tempCanvas.width = dims.width
    tempCanvas.height = dims.height
    frameImageData = tempCtx.createImageData(dims.width, dims.height)
  }

  // set the patch data as an override
  frameImageData.data.set(frame.patch)

  // draw the patch back over the canvas
  tempCtx.putImageData(frameImageData, 0, 0)

  gifCtx.drawImage(tempCanvas, dims.left, dims.top)
}
function playpause() {
    playing = !playing
    if (playing) {
        startTime = performance.now();
        renderFrame();
    }
  }
  
function renderGIF(frames) {
    loadedFrames = frames
    frameIndex = 0
  
    canvas.width = frames[0].dims.width
    canvas.height = frames[0].dims.height
  
    gifCanvas.width = canvas.width
    gifCanvas.height = canvas.height
    renderFrame()

    // if (!playing) {
    //   playpause()
    // }
  }
  
// const v = document.createElement('video')
// const startTime = performance.now()
// v.controls = true;
// console.time('load')
// v.src = './2.webm'
// v.onloadedmetadata=() => {
//     console.log('元数据', performance.now() - startTime)
// }
// // v.oncanplay=() => {
// //     console.log('可播放', performance.now() - startTime)
// // }
// v.onloadeddata=() => {
//     console.log('数据', performance.now() - startTime)
// }
// let seekStart = performance.now()
// v.onseeking = () => {
//     seekStart = performance.now()

// }
// v.onseeked = () => {
//     console.log('seek完成', performance.now() - seekStart)
// }
// document.body.appendChild(v)