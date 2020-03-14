const videoElement = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const videoSelectBtn = document.getElementById('videoSelectBtn');
const jquery = require('jquery')
const closepanel = document.getElementById('close')
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
let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {
    videoSelectBtn.innerHTML = source.name;
    const constraints = {
        audio: true,
        video: true,
        // video: {
        //     mandatory: {
        //         chromeMediaSource: 'desktop',
        //         chromeMediaSourceId: source.id
        //     }
        // }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints); //create a stream for recording

    videoElement.srcObject = stream;
    videoElement.play() //play the stream

    const options = { mimeType: 'video/webm' };
    mediaRecorder = new MediaRecorder(stream, options);

    //event handler for mediarecorder.start
    jquery("#startBtn").on('click', function() {
        mediaRecorder.start()
        console.log(mediaRecorder.state)
        stopBtn.style.display = "block"
        this.style.display = "none"

    })
    jquery("#stopBtn").on('click', function() {
            mediaRecorder.stop();
            this.style.display = "none"
            startBtn.style.display = "block"
        })
        // mediaRecorder = new MediaStream(stream, options)
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

}
// closepanel.onclick = () => {
//     console.log('closed')
//     app.quit()
// }

function handleDataAvailable(e) {
    console.log('vide data available')
    recordedChunks.push(e.data)
}

const { dialog } = remote;
const { writeFile } = require('fs');

async function handleStop(e) {

    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });
    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('video saved successfully'));
}