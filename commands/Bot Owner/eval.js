const Discord = require('discord.js');

module.exports = {
  name: "eval",
  aliases: [],
  desc: "Evaluate an expression",
  cooldown: 2,
  async exec(client, message, args) {
    if (!["502446928303226890"].includes(message.author.id)) throw new Error("You don't have enough permissions to evaluate a command on me");
    try {
      const result = eval(args.join(" "));
      return message.channel.send(new Discord.MessageEmbed().setTimestamp().setColor(client.colors.info).setAuthor(`${message.author.tag} | Eval`).setDescription(`\`\`\`${(result || "undefined").replace(client.token, "CYKA BLYAT")}\`\`\``));
    } catch(e) {
      throw new Error(e.stack);
    }
  }
}