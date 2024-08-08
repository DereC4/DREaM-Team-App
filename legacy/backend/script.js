let mediaRecorder;
let audioChunks = [];

console.log("Script loaded and initialized.");

document.getElementById("startRecord").addEventListener("click", () => {
    console.log("Start recording button clicked.");
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            console.log("Media stream obtained.");
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                console.log("Recording data available.");
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = async () => {
                console.log("Recording stopped.");
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = []; // Reset audioChunks for the next recording
                await sendAudioToServer(audioBlob);
            };
            mediaRecorder.start();
            console.log("MediaRecorder started.");
            document.getElementById("startRecord").disabled = true;
            document.getElementById("stopRecord").disabled = false;
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
});

document.getElementById("stopRecord").addEventListener("click", () => {
    console.log("Stop recording button clicked.");
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById("startRecord").disabled = false;
        document.getElementById("stopRecord").disabled = true;
    }
});

async function sendAudioToServer(audioBlob) {
    console.log("Sending audio to server.");
    if (!audioBlob.type.startsWith('audio/')) {
        console.error('The file is not an audio file.');
        document.getElementById("transcription").textContent = 'The file is not an audio file.';
        return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    try {
        const response = await fetch('http://127.0.0.1:8005/transcribe/', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Server response received:", data);
        document.getElementById("transcription").textContent = data.transcription;
    } catch (error) {
        console.error('Fetch Error:', error);
        document.getElementById("transcription").textContent = 'Error processing audio.';
    }
}