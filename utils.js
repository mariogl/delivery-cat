require("dotenv").config();
const debug = require("debug")("discord-bot:utils");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

const cloneRepo = (repoUrl, channel, category) => {
  try {
    const folder = path.join(
      "..",
      process.env.BOOTCAMP,
      category.toLowerCase(),
      "entregas",
      channel
    );
    fs.mkdirSync(folder);
    process.chdir(folder);

    const stdoutGitClone = execSync(`git clone ${repoUrl}`, {
      encoding: "utf-8",
    });

    debug(stdoutGitClone);
  } catch (error) {
    debug(chalk.red(error.message));
    const customError = new Error("No se ha podido clonar el repo");
    customError.custom = true;
    throw customError;
  }
};

const allowedCategoryNames = [
  ...[...Array(12).keys()].slice(1).map((week) => `Week ${week}`),
  "Final projects",
  "deliverables",
];

const allowedChannelNames = [
  ...[...Array(5).keys()].slice(1).map((challenge) => `challenge-${challenge}`),
  "challenge-weekend",
];

const extractChannel = async (msg) => {
  const channel = msg.guild.channels.cache.get(msg.channelId);
  const category = msg.guild.channels.cache.get(channel.parentId);

  return {
    channel,
    category,
  };
};

const extractInfo = async (msg) => {
  const message = msg.content.trim();
  let { nickname } = await msg.guild.members.fetch(msg.author);
  nickname = nickname
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll(" ", "-")
    .toLowerCase();

  return {
    message,
    nickname,
  };
};

const isDeliveryChannel = (categoryName, channelName) =>
  allowedCategoryNames.includes(categoryName) &&
  allowedChannelNames.includes(channelName);

const checkLineFormat = (line) =>
  line.startsWith("Repo:") ||
  line.startsWith("Prod:") ||
  line.startsWith("Front - repo:") ||
  line.startsWith("Front - prod:") ||
  line.startsWith("Back - repo:") ||
  line.startsWith("Back - prod:") ||
  line.startsWith("Trello:") ||
  line.startsWith("Grupo:");

const getExpectedRepoPrefix = (categoryName, channelName) => {
  let nWeek = categoryName.split(" ")[1];
  if (nWeek === "projects") {
    nWeek = 9;
  }
  const nChallenge = channelName.split("-")[1];

  return `${process.env.BOOTCAMP}-W${nWeek}CH${
    nChallenge === "weekend" ? "WE" : nChallenge
  }`;
};

module.exports = {
  isDeliveryChannel,
  extractInfo,
  extractChannel,
  cloneRepo,
  checkLineFormat,
  getExpectedRepoPrefix,
};