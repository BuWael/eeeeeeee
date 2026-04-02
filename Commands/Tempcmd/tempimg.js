const { loadImage, Canvas } = require('canvas');
const Pro = require("pro.db");
const { owners } = require(`${process.cwd()}/config`);

module.exports = {
  name: 'tempimg',
  description: 'Set an image for evaluation',
  usage: '!setimage <imageURL> or attach an image',
  run: async (client, message, args) => {

    if (!owners.includes(message.author.id)) return message.react('❌');
    const isEnabled = Pro.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
        return; 
    }


    let imageURL;

    if (args[0]) {
      imageURL = args[0];
    } else if (message.attachments.size > 0) {
      imageURL = message.attachments.first().url;
    } else {
      return message.reply("**يرجى ارفاق رابط الصورة أو الصورة.**");
    }

    Pro.set(`tempimg_${message.guild.id}`, imageURL);
    message.react('☑️');
  }
};
