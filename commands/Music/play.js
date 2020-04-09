
const ytdl = require('ytdl-core');
const search = require('yt-search');

module.exports = {
  name: "play",
  aliases: ["p"],
  desc: "Play a song of your choice from YouTube",
  cooldown: 3,
  async exec(client, message, args) {
    if (!args[0]) throw new Error("You need to provide a search string or a YouTube URL!");
    let url = args;
    if (!args[0].startsWith("http")) {
      let res = await search(args.join(" "));
      let videos = res.videos.slice(0, 10);
      const requestMsg = message.channel.send(new videos.map((video, index) => `**${index + 1}**: ${video.title.includes(video.author.name) ? video.title.replace(video.author.name, `**${video.author.name}**`) : `**${video.title}** by *${video.author.name}*`}`));
      
    }
    let serverQueue = client.queue.get(message.guild.id)
    if (!serverQueue) {
    }
    
  }
}