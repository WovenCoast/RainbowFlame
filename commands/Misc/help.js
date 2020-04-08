module.exports = {
  name: "help",
  aliases: ["h"],
  exec(message, args) {
    message.channel.send("test");
  }
}