const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "DB connection error:"));
db.once("open", function (callback) {
  console.log("DB Connected");
});

const postSchema = new mongoose.Schema({
  id: String,
  title: String,
  status: String,
  date: String,
  author: String,
  content: String,
});
const postList = db.model("post", postSchema, "post");

async function addPost(data) {
  const post = new postList(data);

  await post.save().then(function (err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("add post " + data.id + " done");
  });
}

module.exports = addPost;
