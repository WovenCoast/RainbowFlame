const Discord = require('discord.js');

module.exports = {
  name: "help",
  aliases: ["h"],
  async exec(client, message, args) {
    if (!args[0]) {
      const embed = new Discord.MessageEmbed().setColor(client.colors.info).setTitle();
      Object.keys(client.categories).forEach(category => {
        client.commands.filter(command => command.category === category).forEach()
      })
    } else {
      
    }
  }
}