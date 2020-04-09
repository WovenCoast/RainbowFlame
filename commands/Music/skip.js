module.exports = {
  name: "skip",
  aliases: [],
  desc: "Skip a playback song",
  async exec (client, message, args) {
    const serverQueue = client.queue.get(message.guild.id);
    if (!serverQueue) throw new Error("This command only works when I'm in a voice channel, try using the `play` command!");
    let count = 1;
    if (args[0] && !isNaN(args[0])) count = parseInt(args[0]);
    for (let i = 0; i < count; i++) {
      if (serverQueue.loop === "one") {
        serverQueue.songs.push(serverQueue.songs.shift());
      }
      if (!serverQueue.songs[0]) count = i;
      serverQueue.dispatcher.end("finish");
    }
    return message.channel.send(`:white_check_mark: Skipped **${client.util.pluralify(count, "song")}**!`)
  }
}