module.exports = {
  name: "skip",
  aliases: [],
  desc: "Skip a playback song",
  async exec (client, message, args) {
    const serverQueue = client.queue.get(message.guild.id);
    if (!serverQueue) throw new Error("This command only works when I'm in a voice channel, try using the `play` command!");
    
  }
}