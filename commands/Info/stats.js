const Discord = require('discord.js');

module.exports = {
  name: "stats",
  aliases: [],
  desc: "View the stats of this bot",
  async exec(client, message, args) {
    console.log(process);
    return message.channel.send(new Discord.MessageEmbed().setColor(client.colors.info).setAuthor(`${message.author.tag} | Stats`, message.author.displayAvatarURL()).addField("Software Versions", `Node: ${process.version}\nDiscord.js: **${Discord.version}**`));
  }
}