const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("text", input.value);
    const item = document.createElement("li");
    item.classList.add("list-group-item");
    item.textContent = input.value;
    messages.appendChild(item);
    input.value = "";
  }
});

socket.on("text", (msg) => {
  const item = document.createElement("li");
  item.classList.add("list-group-item");
  item.textContent = msg[0];
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
