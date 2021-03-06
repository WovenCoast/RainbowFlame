const Discord = require("discord.js");
const os = require("os");

module.exports = {
  name: "stats",
  aliases: ["info", "stat", "botstat"],
  desc: "View the stats of this bot",
  async exec(client, message, args) {
    return message.channel.send(
      new Discord.MessageEmbed()
        .setTimestamp()
        .setColor(client.colors.info)
        .setThumbnail(client.user.displayAvatarURL)
        .setAuthor(
          `${message.author.tag} | Stats`,
          message.author.displayAvatarURL()
        )
        .addField(
          "Software Info",
          `Node: \`${process.versions.node}\`\nDiscord.js: \`v${Discord.version}\`\nPlatform: \`${process.platform} (${process.arch})\``
        )
        .addField(
          "Server Info",
          `Uptime: \`${client.util.convertMs(
            client.uptime
          )}\`\nMemory Usage: \`${client.util.convertBytes(
            process.memoryUsage().heapUsed
          )} / ${client.util.convertBytes(os.totalmem())}\``
        )
    );
  }
};
