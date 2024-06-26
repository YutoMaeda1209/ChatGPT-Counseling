const socket = io.connect();
let processor = null;
let localstream = null;
let clickCount = 0;

const button = document.getElementById("recordButton");
button.addEventListener("click", () => {
  clickCount++;
  if (clickCount % 2 === 1) {
    startRecording();
    button.classList.remove("btn-primary");
    button.classList.add("btn-danger");
  } else {
    stopRecording();
    button.classList.remove("btn-danger");
    button.classList.add("btn-primary");
  }
});

function startRecording() {
  console.log("start recording");
  context = new window.AudioContext();
  socket.emit("voice/start", { sampleRate: context.sampleRate });

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      localstream = stream;
      const input = this.context.createMediaStreamSource(stream);
      processor = context.createScriptProcessor(4096, 1, 1);

      input.connect(processor);
      processor.connect(context.destination);

      processor.onaudioprocess = (e) => {
        const voice = e.inputBuffer.getChannelData(0);
        socket.emit("voice/send/user", voice.buffer);
      };
    })
    .catch((e) => {
      console.log(e);
    });
}

function stopRecording() {
  console.log("stop recording");
  processor.disconnect();
  processor.onaudioprocess = null;
  processor = null;
  localstream.getTracks().forEach((track) => {
    track.stop();
  });
  socket.emit("voice/end", "", (res) => {
    console.log(`Audio data is saved as ${res.filename}`);
  });
}

const audioPlayer = document.getElementById("audioPlayer");
socket.on("voice/send/gpt", (data) => {
  const blob = new Blob([data[0]], { type: "audio/mp3" });
  const url = URL.createObjectURL(blob);
  audioPlayer.src = url;
  audioPlayer.play();
});
