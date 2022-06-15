module.exports = {
  name: "clear",
  aliases: [],
  description: "console.clear",
  execution: data => {
    console.clear();

    return { message: '', };
  },
}
