const { owners } = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require('pro.db');

module.exports = {
  name: "setup",
  description: "Create temporary rooms and linked command channel",
  run: async (client, message, args) => {
    
    if (!owners.includes(message.author.id)) return message.react('❌');
    const isEnabled = Data.get(`command_enabled_${module.exports.name}`);
    if (isEnabled === false) {
        return; 
    }
    const category = await message.guild.channels.create('temporary Rooms', { type: 'GUILD_CATEGORY' });

    const voiceChannel = await message.guild.channels.create('➕ Click Here', {
      type: 'GUILD_VOICE',
      parent: category.id
    });

    Data.set(`category_${message.guild.id}`, category.id);
    Data.set(`voiceChannel_${message.guild.id}`, voiceChannel.id);

    message.react('☑️');
  },
};
