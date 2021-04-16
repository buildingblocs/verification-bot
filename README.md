<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://cdn.discordapp.com/attachments/698842420644937728/802829573833883658/orange_transparent.png" alt="Bot logo"></a>
</p>

<h3 align="center">BBCS Discord Bot</h3>

---

<p align="center"> For server, by students.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [How it works](#working)
- [Usage](#usage)
- [Deploying your own bot](#deployment)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

This bot overlooks the BuildingBloCS Discord server, welcoming participants and managing committee member roles. The purposes of this bot vary from year to year, depending on the organizational requirements of the current year.

## 💭 How it works <a name = "working"></a>

Two bots run on execution, with the first one managing everything else and the second one delegated to reaction roles, to bypass some inherent issues with the reaction role module. 

Messages starting with `&` are directed towards the bot and should be immediately followed with a keyword without a space in between. Any other words after the keyword separated by spaces are optional arguments. The `processCommand` function is where messages are parsed and understood by the bot, where `primaryCommand` stores the keyword and `arguments` stores an array of arguments. New commands should be processed in a new function following the format `{insertcommandhere}Command` and called in a switch case in the `processCommand` function.

The entire bot is written in Javascript using Discord.js.

## 🎈 Usage <a name = "usage"></a>

To use the reaction role feature, first type &poll in the channel you want to create the message in. Copy the message ID by right-clicking and type &role {messageID} without the curly braces for the reactions.

Current service year: 2021

## 🚀 Deploying your own bot <a name = "deployment"></a>

### For launching a copy of the bot on your own

Ensure that your environment variables using Node.js are pointing to the bot tokens you have created on the [Discord Developer Portal](https://discord.com/developers/docs/game-sdk/applications).
Push the project to Heroku as a worker (not web). This is done by editing the Procfile, which has already been done.

### For pushing your changes onto the official bot

Either invite your new version of the app to the server, or if you're unable to invoke any changes to the bot then send a pull request to this repository with your new code and ping the current bot maintainer.

Current bot maintainer: - [@DHS Isaac C](https://github.com/Iscaraca)

## ✍️ Authors <a name = "authors"></a>

- [@isaacchen](https://github.com/Iscaraca)
- [@chongtzezhao](https://github.com/thepoppycat)
