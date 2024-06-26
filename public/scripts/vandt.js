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

  const choice1 = document.getElementById("choice1");
  const choice2 = document.getElementById("choice2");
  const choice3 = document.getElementById("choice3");
  choice1.textContent = data[1];
  choice2.textContent = data[2];
  choice3.textContent = data[3];
  choice1.disabled = false;
  choice2.disabled = false;
  choice3.disabled = false;
});

function sendChoice(choice) {
  let choiceText;
  const choice1 = document.getElementById("choice1");
  const choice2 = document.getElementById("choice2");
  const choice3 = document.getElementById("choice3");
  choice1.disabled = true;
  choice2.disabled = true;
  choice3.disabled = true;
  switch (choice) {
    case 1:
      choiceText = choice1.textContent;
      break;
    case 2:
      choiceText = choice2.textContent;
      break;
    case 3:
      choiceText = choice3.textContent;
      break;
  }
  choice1.textContent = "";
  choice2.textContent = "";
  choice3.textContent = "";
  socket.emit("voice/send/text", choiceText);
}
