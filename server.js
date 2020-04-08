const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.TOKEN);

const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const redirect = 'https://flamecord.glitch.me/api/discord/callback';

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get('/api/discord/login', (req, res) => {
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${encodeURIComponent(redirect)}`);
});
app.get('/api/discord/callback', (req, res) => {
  
})

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
