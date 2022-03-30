require("dotenv").config();
const debug = require("debug")("discord-bot:checkDeliverable");
const { Octokit } = require("@octokit/rest");
const chalk = require("chalk");
const getRandomYield = require("./randomYields");
const {
  extractInfo,
  isDeliveryChannel,
  cloneRepo,
  checkLineFormat,
  getExpectedRepoPrefix,
} = require("./utils");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const checkDeliverable = async (msg, isEdit = false) => {
  const { channel, category, message, nickname } = await extractInfo(msg);

  if (!isDeliveryChannel(category.name, channel.name)) {
    return;
  }

  debug(chalk.green("\n========================================"));
  debug(
    chalk.green(`Revisando entrega de ${nickname}${isEdit ? " (editada)" : ""}`)
  );
  debug(chalk.green("========================================"));

  const thread =
    msg.thread ??
    (await msg.startThread({
      name: "revisión",
    }));

  const lines = message.split("\n");

  try {
    for (const line of lines) {
      debug(chalk.blueBright("1. Inicio de las líneas:"));
      if (!checkLineFormat(line)) {
        const error = new Error("Error en el formato de la línea");
        error.delivery = true;
        throw error;
      }

      debug(chalk.greenBright("-> OK"));

      let repoURL;

      if (!line.startsWith("Repo:") && !line.startsWith("Front - repo:")) {
        continue;
      }

      if (!line.includes("https://github.com")) {
        const error = new Error("Error en el formato de la línea");
        error.delivery = true;
        throw error;
      }

      const repoPath = line.split("https://github.com/")[1];
      const parts = repoPath.split("/");
      const owner = parts[0];
      const repoName = parts.slice(1).join("").replace(".git", "");

      debug(chalk.blueBright("2. Nombre del repo:"));

      const expectedRepoPrefix = getExpectedRepoPrefix(
        category.name,
        channel.name
      );

      if (
        !repoName.startsWith(expectedRepoPrefix) ||
        !repoName.includes(nickname)
      ) {
        const error = new Error("Nombre de repo mal formado");
        error.repo = true;
        error.expectedRepoPrefix = expectedRepoPrefix;
        throw error;
      } else {
        debug(chalk.greenBright("-> OK"));

        debug(chalk.blueBright("3. Comprobando repo en GitHub:"));

        try {
          await octokit.request("GET /repos/{owner}/{repo}/commits", {
            owner,
            repo: repoName,
            per_page: 1,
          });

          debug(chalk.greenBright("OK"));

          debug(chalk.blueBright("4. Clonando repo:"));

          cloneRepo(repoURL, channel.name, category.name.replace(" ", ""));

          debug(chalk.greenBright("OK"));
        } catch (cloneError) {
          debug(chalk.red(cloneError.message));
          debug(chalk.red(cloneError.status));
          const error = new Error("No se ha podido clonar el repo");
          error.repo = true;
          error.status = cloneError.status;
          throw error;
        }
      }
    }

    thread.send("Entrega OK 👌");
  } catch (error) {
    if (error.delivery) {
      debug(chalk.red("Error en el formato de la línea"));
      thread.send(
        `<@${
          msg.author.id
        }> ${getRandomYield()} Revisa que el formato de la entrega sea el que tienes en el primer mensaje de este canal.`
      );
    } else if (error.repo) {
      debug(chalk.red("Error en el repo"));
      let errorMessage;
      if (error.status === 409) {
        errorMessage =
          "Recuerda que el repo tiene que tener al menos un commit 🤖";
      } else if (error.status === 404) {
        errorMessage = "Parece que ese repo no existe... 🙄";
      } else {
        errorMessage = `Revisa que el nombre de tu repo empiece por ${error.expectedRepoPrefix} 💩`;
      }
      thread.send(`<@${msg.author.id}> ${getRandomYield()} ${errorMessage}`);
    }
  }
};

module.exports = checkDeliverable;
