const EventEmitter = require("events");
const { promisify } = require("util");
const config = require("../getURL/config");
const redis = require("redis");
const client = redis.createClient("6379", "127.0.0.1");
const llenAsync = promisify(client.llen).bind(client);
const lpushAsync = promisify(client.lpush).bind(client);

let timer = null;

client.on("error", function (error) {
  console.log(error);
});

client.on("ready", function () {
  console.log("redis ready");
});

class Producer extends EventEmitter {
  constructor() {
    super();
    this.status = "ready";
    this.id = config.beginId;
  }
}

const producer = new Producer();

producer.on("pause", function () {
  if (this.status === "begin") {
    this.status = "pause";
    console.log("producer will pause, current id: ", this.id);
  }
});

producer.on("resume", function () {
  if (this.status === "pause") {
    console.log("producer resume");
    this.emit("begin");
  }
});

producer.on("begin", async function () {
  this.status = "begin";
  console.log("producer begin, current id: ", this.id);
  if (this.id >= config.endId) {
    this.emit("stop");
  } else {
    while (this.id <= config.endId) {
      console.log("while this.id: ", this.id);
      if (this.status === "pause") break;
      const msg = this.id;
      await lpushAsync("mqTest", msg);
      ++this.id;
    }
  }
});

producer.on("stop", async function () {
  clearInterval(timer);
  console.log("producer stop");
});

async function getListLength() {
  const length = await llenAsync("mqTest");
  if (length > 50) {
    producer.emit("pause");
  } else {
    producer.emit("resume");
  }
  return length;
}

producer.emit("begin");
timer = setInterval(getListLength, 10);
