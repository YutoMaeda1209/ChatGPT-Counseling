const { createServer } = require("http");
const { join } = require("path");
const express = require("express");
const { Server } = require("socket.io");
const { OpenAI } = require("openai");
const WavEncoder = require("wav-encoder");
const fs = require("fs");

const openai = new OpenAI();
let messages = [
  {
    role: "system",
    content: "You are a counselor. Be supportive of those with mental illness.",
  },
];

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

app.use("/", express.static(join(__dirname, "public")));

async function textGPT(msg) {
  console.log(`User: ${msg}`);

  messages.push({ role: "user", content: msg });
  const completion = await openai.chat.completions.create({
    messages: messages,
    model: "gpt-4o",
  });
  messages.push({
    role: "assistant",
    content: completion.choices[0].message.content,
  });

  console.log(`ChatGPT: ${completion.choices[0].message.content}`);
  console.table(messages);

  const choices = await createChoices();

  const result = [
    completion.choices[0].message.content,
    choices[0],
    choices[1],
    choices[2],
  ];
  return result;
}
async function createChoices() {
  let promptMessages = JSON.parse(JSON.stringify(messages));
  promptMessages.push({
    role: "system",
    content:
      "Please predict three user responses to the above message. When outputting, please use comma delimiters (abcd, efghijk, lmnopqrstu).",
  });
  const choicesCompletion = await openai.chat.completions.create({
    messages: promptMessages,
    model: "gpt-4o",
  });
  const choices = choicesCompletion.choices[0].message.content.split(",");
  return choices;
}
const toF32Array = (buf) => {
  const buffer = new ArrayBuffer(buf.length);
  const view = new Uint8Array(buffer);
  for (var i = 0; i < buf.length; i++) {
    view[i] = buf[i];
  }
  return new Float32Array(buffer);
};
const exportWAV = (data, sampleRate, filename) => {
  const audioData = {
    sampleRate: sampleRate,
    channelData: [data],
  };
  WavEncoder.encode(audioData).then((buffer) => {
    fs.writeFile(filename, Buffer.from(buffer), (e) => {
      if (e) {
        console.log(e);
      } else {
        console.log(`Successfully saved ${filename}`);
      }
    });
  });
};

io.on("connection", (socket) => {
  socket.on("text", async (msg) => {
    console.log("running text");
    const result = await textGPT(msg);
    console.log("running text");
    socket.emit("text", result);
  });

  let sampleRate = 48000;
  let buffer = [];
  socket.on("voice/start", (data) => {
    console.log("running voice/start");
    sampleRate = data.sampleRate;
    buffer = [];
  });
  socket.on("voice/send/user", (data) => {
    console.log("running voice/send/user");
    const itr = data.values();
    const buf = new Array(data.length);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = itr.next().value;
    }
    buffer = buffer.concat(buf);
  });
  socket.on("voice/end", () => {
    console.log("running voice/end");
    const f32array = toF32Array(buffer);
    const filenaeme = `public/wav/${String(Date.now())}.wav`;
    exportWAV(f32array, sampleRate, filenaeme);

    setTimeout(async () => {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filenaeme),
        model: "whisper-1",
        language: "ja",
      });

      const aaa = await textGPT(transcription.text);

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: aaa[0],
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      const result = [buffer, aaa[1], aaa[2], aaa[3]];

      console.log("running emit voice/send/gpt");
      socket.emit("voice/send/gpt", result);
    }, 100);
  });
  socket.on("voice/send/text", async (msg) => {
    console.log("running emit voice/send/text");
    const completion = await textGPT(msg);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: completion[0],
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    const result = [buffer, completion[1], completion[2], completion[3]];

    console.log("running emit voice/send/gpt");
    socket.emit("voice/send/gpt", result);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
