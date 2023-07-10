const {Client} = require('discord.js-selfbot-v13');
const dotenv = require('dotenv');
require('dotenv').config();
const client = new Client({
  checkUpdate: false,
});

const findTemplate = require('./utils/findTemplate');


client.on('ready', async () =>{ 
  console.log('Bot is online!')
});

client.on('messageCreate', async(message) =>{
  if (message.channel.id === "1128001555161940068") {
    findTemplate(message.content, message.author.nickname);
  }
});

client.login(process.env.TOKEN);

//Haven, WWG Walsh Wealth TraderSZ, Dr.Profit, Chart Champions, Crypto Ken, Chroma, Futures125x