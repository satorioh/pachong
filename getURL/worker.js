const fs = require("fs");
const request = require("request");
const createHeader = require("./header");
const parser = require("./parser");
const config = require("./config");

function requestId(id) {
  const header = createHeader(id);
  return new Promise((resolve, reject) => {
    request(header, function (err, response) {
      if (err) {
        console.log("error", err);
        reject(err);
      }
      if (response.statusCode === 200) {
        console.log("id:", id);
        console.log(process.pid + " success, end time:", process.uptime());
        resolve(parser.processPage(id, response));
      } else {
        console.log("Warning:get http response exception");
      }
    });
  });
}

async function test() {
  const promises = [];
  for (let i = config.beginId; i <= config.endId; i++) {
    promises.push(requestId(i));
  }
  const result = await Promise.all(promises);
  console.log(result.filter((v) => typeof v !== "undefined"));
}

module.exports = requestId;
