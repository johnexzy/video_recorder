const videoElement = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const videoSelectBtn = document.getElementById('videoSelectBtn');
// const closepanel = document.getElementById('close')
videoSelectBtn.onclick = getVideoSources;
// import app from './main.js'
const {
    desktopCapturer,
    remote
} = require('electron');
const { Menu } = remote;

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    //build menu for video sources
    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        }))
    videoOptionsMenu.popup()

}
//media recorder instance
let audioRecorder;
let mediaRecorder;
const recordedChunks = [];
const recordedAudioChunks = [];
async function selectSource(source) {
    videoSelectBtn.innerHTML = source.name;
    const constraints = {
        audio: false,
        // video: true,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }
    const audioConstraints = { audio: true }
    const stream = await navigator.mediaDevices.getUserMedia(constraints); //create a stream for recording\
    navigator.mediaDevices.getUserMedia(audioConstraints).then(function(audioStream) {
        audioRecorder = new MediaRecorder(audioStream);
        //visualize(audioStream)


        videoElement.srcObject = stream;
        videoElement.play() //play the stream

        const options = { audioBitsPerSecond: 128000, videoBitsPerSecond: 2500000, mimeType: 'video/webm' };
        mediaRecorder = new MediaRecorder(stream, options);
        audioRecorder = new MediaRecorder(stream)
            //event handler for mediarecorder.start
        startBtn.onclick = () => {
            audioRecorder.start()
            mediaRecorder.start()
            console.log(mediaRecorder.state)
            console.log(audioRecorder.state)
            startBtn.style.background = "red"
            startBtn.style.color = "black"
        }
        stopBtn.onclick = () => {
                mediaRecorder.stop();
                audioRecorder.stop()
            }
            // mediaRecorder = new MediaStream(stream, options)
        audioRecorder.ondataavailable = handleAudioDataAvailable;
        audioRecorder.onstop = handleAudioStop;


        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
    })
}
// closepanel.onclick = () => {
//     console.log('closed')
//     app.quit()
// }

function handleDataAvailable(e) {
    console.log('video data available')
    recordedChunks.push(e.data)
}

function handleAudioDataAvailable(e) {
    console.log('Audio data available')
    recordedAudioChunks.push(e.data)
}
const { dialog } = remote;
const { writeFile } = require('fs');

async function handleStop(e) {
    startBtn.style.background = "grey"
    startBtn.style.color = "black"
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    var { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });
    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('video saved successfully'));
}
async function handleAudioStop(e) {
    startBtn.style.background = "grey"
    startBtn.style.color = "black"
    const blobAudio = new Blob(recordedAudioChunks, {
        type: 'audio/opus'
    });
    const bufferAudio = Buffer.from(await blobAudio.arrayBuffer());
    var { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `audio-${Date.now()}.mp3`
    });
    console.log(filePath);

    writeFile(filePath, bufferAudio, () => console.log('video saved successfully'));
}