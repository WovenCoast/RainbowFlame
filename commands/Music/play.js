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
    if (!message.member.voice.channel)
      throw new Error("You are not in a voice channel!");
    let url = args[0];
    if (url.startsWith("http")) {
      if (!(await ytdl.validateURL(args[0])))
        throw new Error("The URL must be a valid YouTube video URL!");
      return play(url);
    }
    let res = await search(args.join(" "));
    let videos = res.videos.slice(0, 10);
    const requestMsg = await message.channel.send(
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
      requestMsg.delete();
      play(client, message, song.url);
    });
  }
};

async function play(client, message, url) {
  if (!client.queue.has(message.guild.id)) {
    const connection = await message.member.voice.channel.join();
    const dispatcher = await connection.play(
      ytdl(url, { filter: "audioonly" })
    );
    const serverQueue = {
      connection,
      dispatcher,
      voiceChannel: message.member.voiceChannel,
      loop: "noloop",
      volume: 100,
      songs: [{ url, requestedBy: message.author.tag }]
    };
    dispatcher.volume(dispatcher.volume - serverQueue.volume / 100);
    client.queue.set(message.guild.id, serverQueue);
    message.channel.send("");
    dispatcher.once("finish", async () => {
      const serverQueue = client.queue.get(message.guild.id);
      if (serverQueue.loop === "noloop") {
        serverQueue.songs.shift();
      } else if (serverQueue.loop === "loopall") {
        serverQueue.songs.push(serverQueue.songs.shift());
      } else if (serverQueue.loop === "shuffle") {
        serverQueue.songs = shuffle(serverQueue.songs);
      } else if (serverQueue.loop === "loopone") {
        serverQueue.songs.unshift(serverQueue.songs.shift());
      }
      const newDispatcher = await serverQueue.connection.play(
        serverQueue.songs[0].url
      );
      serverQueue.dispatcher = newDispatcher;
      client.queue.set(message.guild.id, serverQueue);
    });
  } else {
    const serverQueue = client.queue.get(message.guild.id);
    serverQueue.songs.push({ url, requestedBy: message.author.tag });
    client.queue.set(message.guild.id, serverQueue);
  }
}

function shuffle(array) {
  const tempArray = Object.assign([], array);
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = tempArray[currentIndex];
    tempArray[currentIndex] = tempArray[randomIndex];
    tempArray[randomIndex] = temporaryValue;
  }

  return tempArray;
}
