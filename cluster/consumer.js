const redis = require("redis");
const EventEmitter = require("events");
const { promisify } = require("util");
const client = redis.createClient("6379", "127.0.0.1");
const llenAsync = promisify(client.llen).bind(client);
const lpopAsync = promisify(client.lpop).bind(client);
const requestId = require("../getURL/worker");

class Consumer extends EventEmitter {
  constructor() {
    super();
    this.status = "ready";
  }
}

const consumer = new Consumer();

consumer.on("pause", function () {
  console.log("Consumer will pause");
  this.status = "pause";
});

consumer.on("resume", () => {
  console.log("Consumer resume");
  if (this.status === "pause") {
    this.status = "begin";
    this.emit("begin");
  }
});

consumer.on("begin", async function () {
  this.status = "begin";
  while (true) {
    const id = await lpopAsync("mqTest");
    await requestId(id);
    if (this.status === "pause") break;
  }
});

async function getListLength() {
  const length = await llenAsync("mqTest");
  console.log(process.pid + " current list length: ", length);
  if (length === 0 && consumer.status === "begin") {
    consumer.emit("pause");
  } else if (this.status === "pause" && length > 50) {
    consumer.emit("resume");
  }
}

consumer.emit("begin");
setInterval(getListLength, 5000);
