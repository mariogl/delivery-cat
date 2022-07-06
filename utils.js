require("dotenv").config();

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
  let {
    nickname,
    // eslint-disable-next-line prefer-const
    user: { username },
  } = await msg.guild.members.fetch(msg.author);
  nickname = nickname || username;
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
  line.toLowerCase().startsWith("repo:") ||
  line.toLowerCase().startsWith("prod:") ||
  line.toLowerCase().startsWith("front - repo:") ||
  line.toLowerCase().startsWith("front - prod:") ||
  line.toLowerCase().startsWith("back - repo:") ||
  line.toLowerCase().startsWith("back - prod:") ||
  line.toLowerCase().startsWith("trello:") ||
  line.toLowerCase().startsWith("grupo:");

const getExpectedRepoPrefix = (categoryName, channelName) => {
  let nWeek = categoryName.split(" ")[1];
  if (nWeek === "projects") {
    nWeek = 9;
  }
  const nChallenge = channelName.split("-")[1];

  return `${process.env.BOOTCAMP}-w${nWeek}ch${
    nChallenge === "weekend" ? "we" : nChallenge
  }`;
};

module.exports = {
  isDeliveryChannel,
  extractInfo,
  extractChannel,
  checkLineFormat,
  getExpectedRepoPrefix,
};
