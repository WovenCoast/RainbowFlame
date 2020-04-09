const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const search = require("yt-search");

module.exports = {
  name: "play",
  aliases: ["p"],
  desc: "Play a song of your choice from YouTube",
  cooldown: 3,
  async exec(client, message, args) {
    if (!args[0])
      throw new Error("You need to provide a search string or a YouTube URL!");
    if (!message.member.voiceChannel)
      throw new Error("You are not in a voice channel!");
    if (message.guild.me.voiceChannel !== message.member.voiceChannel)
      throw new Error("You aren't in the same channel as me!");
    let url = args;
    if (url.startsWith("http")) return play(url);
    let res = await search(args.join(" "));
    let videos = res.videos.slice(0, 10);
    const requestMsg = message.channel.send(
      new Discord.MessageEmbed()
        .setTimestamp()
        .setAuthor(
          `${message.author} | Choose a Song`,
          message.author.displayAvatarURL()
        )
        .setColor(client.colors.info)
        .setFooter("Reply in 30 seconds with the option you choose")
        .setDescription(
          videos.map(
            (video, index) =>
              `**${index + 1}**: ${
                video.title.includes(video.author.name)
                  ? video.title.replace(
                      video.author.name,
                      `**${video.author.name}**`
                    )
                  : `**${video.title}** by *${video.author.name}*`
              }`
          )
        )
    );

    const collector = message.channel.createMessageCollector(
      m => !isNaN(m.content) && m.content < videos.length + 1 && m.content > 0
    );
    collector.once("collect", m => {
      const song = videos[parseInt(m.content) - 1];
      url = song.url;
      play(client, message, url);
    });
  }
};

function play(client, message, url) {
  
}
