const ytdl = require('ytdl-core');

module.exports = {
  name: "play",
  aliases: ["p"],
  desc: "Play a song of your choice from YouTube",
  cooldown: 3,
  async exec(client, message, args) {
    if (!client.queue.has(message.guild.id)) {
      
    }
  }
}