const Discord = require('discord.js');

module.exports = {
  name: "help",
  aliases: ["h"],
  async exec(client, message, args) {
    if (!args[0]) {
      const embed = new Discord.MessageEmbed().setColor(client.colors.info).setAuthor(`${message.author.tag} | Help`, message.author.displayAvatarURL());
      Object.keys(client.categories).forEach(category => {
        const commands = client.commands.filter(command => command.category === category);
        embed.addField(`**${category}**: ${commands.size}`, commands.map(command => `\`${command.name}\``).join(", "));
      })
      return message.channel.send(embed);
    } else {
      if (Object.keys(client.categories).some(category => category.toLowerCase() === args[0])) {
        const embed = Discord.Message
      }
    }
  }
}