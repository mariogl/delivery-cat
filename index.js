require("dotenv").config();
const debug = require("debug")("discord-bot:index");

const chalk = require("chalk");
const { Client, Intents } = require("discord.js");
const checkDeliverable = require("./checkDeliverable");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  debug(chalk.yellow(`Logged in as ${client.user.tag}!`));
});

client.on("messageUpdate", (oldMsg, newMsg) => {
  if (newMsg.author.bot || oldMsg.content === newMsg.content) {
    return;
  }
  checkDeliverable(newMsg, true);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) {
    return;
  }
  checkDeliverable(msg);
});
