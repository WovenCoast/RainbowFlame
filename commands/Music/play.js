module.exports = {
  name: "play",
  aliases: ["p"],
  desc: "Play a song of your choice from YouTube",
  async exec(client, message, args) {
    if (!args[0]) throw new Error("No url provided with the message");
  }
}