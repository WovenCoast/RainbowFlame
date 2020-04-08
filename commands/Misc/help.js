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
      const embed = new Discord.MessageEmbed().setColor(client.colors.info).setAuthor(`${message.author.tag} | Help`, message.author.displayAvatarURL());
      if (Object.keys(client.categories).some(category => category.toLowerCase() === args[0].toLowerCase())) {
        const category = Object.keys(client.categories).find(category => category.toLowerCase() === args[0].toLowerCase());
        embed.setTitle(`${category}: ${client.categories[category].length} Commands`);
        embed.setDescription(client.categories[category].map(commandName => `\`${commandName}\``).join(", "));
      }
      return message.channel.send(embed);
    }
  }
}