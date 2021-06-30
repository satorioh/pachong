const cheerio = require("cheerio");

const parser = {
  processPage: async function (id, response) {
    $ = cheerio.load(response.body);
    if (this.ifNeedParse($)) {
      const [title, status, date, author, content] = await Promise.all([
        this.getTitle($),
        this.getStatus($),
        this.getDate($),
        this.getAuthor($),
        this.getContent($),
      ]);
      return { id, title, status, date, author, content };
    }
  },
  ifNeedParse: function ($) {
    return !$("title").text().includes("提示信息");
  },
  getTitle: async function ($) {
    return $("#thread_subject").text();
  },
  getStatus: async function ($) {
    return $(".view_title .xg1 img").attr("alt");
  },
  getDate: async function ($) {
    return $(".authi").first().find("em").text().slice(4);
  },
  getAuthor: async function ($) {
    return $(".pls_title").first().find("a").text();
  },
  getContent: async function ($) {
    return $(".t_f").first().text().trim().slice(0, 500);
  },
};

module.exports = parser;
