class Util {
  constructor(client) {
    this.client = client;
  }

  convertMs(ms) {
    const showWith0 = value => (value < 10 ? `0${value}` : value);
    const days = showWith0(Math.floor((ms / (1000 * 60 * 60 * 24)) % 60));
    const hours = showWith0(Math.floor((ms / (1000 * 60 * 60)) % 24));
    const minutes = showWith0(Math.floor((ms / (1000 * 60)) % 60));
    const seconds = showWith0(Math.floor((ms / 1000) % 60));
    if (parseInt(days)) return `${days}d`;
    if (parseInt(hours)) return `${hours}h`;
    if (parseInt(minutes)) return `${minutes}min`;
    if (parseInt(seconds)) return `${seconds}s`;
    if (parseInt(ms)) return `${ms}ms`;
  }
  convertBytes(bytes) {
    const decimals = 2;
    if (bytes == 0) return "0 Bytes";
    var k = 1024,
      dm = decimals <= 0 ? 0 : decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  titleCase(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
  }
  pluralify(amount, string) {
    if (amount === 1) return amount + " " + string;
    else return amount + " " + string + "s";
  }
}
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const client = new Discord.Client();
client.prefix = ["!", "."];
client.on("ready", () => {
  console.log(`Ready as ${client.user.tag}`);
});
client.colors = {
  info: "#92DFF3",
  error: "RED",
  success: "GREEN"
};
client.commandsExec = 0;
client.commandsSuccess = 0;
client.commaandsFail = 0;
client.defaultCooldown = 2;
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.cooldown = new Discord.Collection();
client.categories = {};
client.util = new Util(client);
fs.readdirSync(path.join(__dirname, "./commands")).forEach(dir => {
  client.categories[client.util.titleCase(dir)] = [];
  fs.readdirSync(path.join(__dirname, "./commands", dir)).forEach(
    commandPath => {
      const command = require(path.join(
        __dirname,
        "./commands",
        dir,
        commandPath
      ));
      command.category = client.util.titleCase(dir);
      client.categories[command.category].push(command.name);
      client.commands.set(command.name, command);
      command.aliases.forEach(alias => {
        client.aliases.set(alias, command.name);
      });
    }
  );
});
client.on("message", async message => {
  if (message.author.bot) return;
  if (
    message.content.trim() === `<@${client.user.id}>` ||
    message.content.trim() === `<@!${client.user.id}>`
  )
    return message.channel.send(
      `Hey there! Try doing \`${client.util.getRandom(
        client.prefix
      )}help\` to see my commands!`
    );
  const prefixes = [
    `<@${client.user.id}>`,
    `<@!${client.user.id}>`,
    ...client.prefix
  ];
  if (!prefixes.some(p => message.content.startsWith(p.toLowerCase()))) return;
  const prefix = prefixes
    .find(p => message.content.startsWith(p.toLowerCase()))
    .toLowerCase();
  const invoke = message.content
    .substr(prefix.length, message.content.length)
    .trim()
    .split(" ")[0]
    .toLowerCase();
  if (!client.commands.has(invoke) && !client.aliases.has(invoke))
    return message.channel.send(
      `**${invoke}** is not a valid command. Try doing \`${client.util.getRandom(
        client.prefix
      )}help\` to see what my commands are!`
    );
  const command = client.commands.has(invoke)
    ? client.commands.get(invoke)
    : client.commands.get(client.aliases.get(invoke));
  const args = message.content
    .slice(invoke.length + prefix.length + 1)
    .trim()
    .split('"')
    .map((e, i) => (i % 2 === 0 ? e.trim().split(" ") : [e.trim()]))
    .flat(1);
  message.prefix = prefix;
  message.invoke = invoke;
  message.args = args;
  if (client.cooldown.has(`${message.author.id}-${message.guild.id}-${command.name.toLowerCase()}`)) {
    const timeGone = Date.now() - client.cooldown.get(`${message.author.id}-${message.guild.id}-${command.name.toLowerCase()}`) / 1000;
    if (timeGone + 1 > (command.cooldown || client.defaultCooldown)) client.cooldown.set(`${message.author.id}-${message.guild.id}-${command.name.toLowerCase()}`, Date.now());
    else return message.channel.send(new Discord.MessageEmbed().setTimestamp()
          .setAuthor(`${message.author.tag} | ${client.util.titleCase(invoke)}`)
          .setColor(client.colors.error)
          .setDescription(`Error: You need to wait ${(command.cooldown || client.defaultCooldown) - timeGone} more seconds before you can use that command!`))
  } else {
    client.cooldown.set(`${message.author.id}-${message.guild.id}-${command.name.toLowerCase()}`, Date.now());
  }
  client.commandsExec++;
  command
    .exec(client, message, args)
    .then(() => {
      client.commandsSuccess++;
    })
    .catch(err => {
      client.commandsFail++;
      message.channel.send(
        new Discord.MessageEmbed().setTimestamp()
          .setAuthor(`${message.author.tag} | ${client.util.titleCase(invoke)}`)
          .setColor(client.colors.error)
          .setDescription(err)
      );
    });
});
client.login(process.env.DISCORD_TOKEN);
const express = require("express");
const fetch = require("node-fetch");
const btoa = require("btoa");
const session = require("express-session");
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
    saveUninitialized: false
  })
);
app.use((err, req, res, next) => {
  switch (err.message) {
    case "NoCodeProvided":
      return res.status(400).send({
        status: "ERROR",
        error: err.message
      });
    default:
      return res.status(500).send({
        status: "ERROR",
        error: err.message
      });
  }
});
const catchAsync = fn => (req, res, next) => {
  const routePromise = fn(req, res, next);
  if (routePromise.catch) {
    routePromise.catch(err => next(err));
  }
};
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.session.redirectURL = req.baseURL;
    res.redirect("/api/discord/login");
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/test", requireAuth, (req, res) => {
  res.render("index.ejs");
});
app.get("/api/discord/login", (req, res) => {
  if (req.session.user) {
    res.redirect(req.session.redirectURL || "https://flamecord.glitch.me/");
  } else {
    res.redirect(
      `https://discordapp.com/api/oauth2/authorize?client_id=${
        process.env.CLIENT_ID
      }&scope=${encodeURIComponent(
        "identify email guilds"
      )}&response_type=code&redirect_uri=${encodeURIComponent(
        "https://flamecord.glitch.me/api/discord/callback"
      )}`
    );
  }
});
app.get(
  "/api/discord/callback",
  catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error("NoCodeProvided");
    const code = req.query.code;
    const response = await fetch(
      `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${"https://flamecord.glitch.me/api/discord/callback"}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          )}`
        }
      }
    );
    const json = await response.json();
    req.session.accessToken = json.access_token;
    req.session.refreshToken = json.refresh_token;
    const userData = await fetch("https://discordapp.com/api/users/@me", {
      method: "GET",
      headers: {
        Authorization: `${json.token_type} ${json.access_token}`
      }
    })
      .then(res => res.json())
      .catch(console.error);
    req.session.user = userData;
    const guildData = await fetch(
      "https://discordapp.com/api/users/@me/guilds",
      {
        method: "GET",
        headers: {
          Authorization: `${json.token_type} ${json.access_token}`
        }
      }
    )
      .then(res => res.json())
      .catch(console.error);
    req.session.user.guilds = guildData.filter(
      g => !!client.guilds.resolve(g.id)
    );
    res.redirect(req.session.redirectURL || "https://flamecord.glitch.me/");
    console.log(req.session.user);
    req.session.redirectURL = undefined;
  })
);

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
