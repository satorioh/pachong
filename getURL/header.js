function createHeader(id) {
  return {
    url: "test.com/" + id,
    timeout: 20000,
  };
}

module.exports = createHeader;
