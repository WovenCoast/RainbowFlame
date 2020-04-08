function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const client = new Discord.Client();
client.prefix = ["!", "."];
client.on('ready', () => {
  console.log(`Ready as ${client.user.tag}`);
  client.prefix.unshift(client.user.toString());
});
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdirSync(path.join(__dirname, "./commands")).forEach(dir => {
  fs.readdirSync(path.join(__dirname, "./commands", dir)).forEach(commandPath => {
    const command = require(path.join(__dirname, "./commands", dir, commandPath));
  })
})
client.on('message', (message) => {
  if (message.content.trim() === client.user.toString()) return message.channel.send(`Hey there! Try doing **${pickRandom(client.prefix)} help** to see my commands!`);
  
  if (!client.prefix.some(p => message.content.split(" ")[0].startsWith(p.toLowerCase()))) return;
  const prefix = client.prefix.find(p => message.content.split(" ")[0].startsWith(p.toLowerCase())).toLowerCase();
  const invoke = message.content.substr(prefix.length, message.content.length).trim().split(' ')[0].toLowerCase();
  
  if (!client.commands.has(invoke) && !client.aliases.has(invoke)) return message.channel.send(`**${invoke}** is not a valid command. Try doing **${prefix} help** to see what my commands are!`);
});
client.login(process.env.TOKEN);

const express = require("express");
const fetch = require('node-fetch');
const btoa = require('btoa'),
      session = require("express-session"),
      MemcachedStore = require("connect-memcached")(session);
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  session({
    secret: "CatOnKeyboard",
    key: "test",
    proxy: "true",
    cookie: { secure: true },
    resave: false,
    saveUninitialized: false,
    store: new MemcachedStore({
      hosts: ["127.0.0.1:11211"],
      secret: "123, easy as ABC. ABC, easy as 123" // Optionally use transparent encryption for memcache session data
    })
  })
);
app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});
const catchAsync = fn => (
  (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(err => next(err));
    }
  }
);
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.session.redirectURL = req.baseURL;
    res.redirect('/api/discord/login');
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/test", requireAuth, (req, res) => {
  res.render("index.ejs");
})
app.get('/api/discord/login', (req, res) => {
  if (req.session.user) {
    res.redirect(req.session.redirectURL || "https://flamecord.glitch.me/");
  } else {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=${encodeURIComponent('identify email guilds')}&response_type=code&redirect_uri=${encodeURIComponent('https://flamecord.glitch.me/api/discord/callback')}`);
  }
});
app.get('/api/discord/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${'https://flamecord.glitch.me/api/discord/callback'}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)}`,
      },
    });
  const json = await response.json();
  req.session.accessToken = json.access_token;
  req.session.refreshToken = json.refresh_token;
  const userData = await fetch('https://discordapp.com/api/users/@me', {
    method: 'GET',
    headers: {
      Authorization: `${json.token_type} ${json.access_token}`
    }
  })
    .then(res => res.json())
    .catch(console.error);
  req.session.user = userData;
  const guildData = await fetch('https://discordapp.com/api/users/@me/guilds', {
    method: 'GET',
    headers: {
      Authorization: `${json.token_type} ${json.access_token}`
    }
  })
    .then(res => res.json())
    .catch(console.error);
  req.session.user.guilds = guildData.filter(g => !!client.guilds.resolve(g.id));
  res.redirect(req.session.redirectURL || 'https://flamecord.glitch.me/');
  console.log(req.session.user);
  req.session.redirectURL = undefined;
}));

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
