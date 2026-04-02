require('dotenv').config();
const fs = require('fs');
const { Client, Collection, MessageActionRow, MessageButton, TextInputComponent, Modal } = require("discord.js");
const express = require('express');
const { exec } = require('child_process');
const ms = require("ms");
const canvas = require('canvas');
const db = require('pro.db');

// 1. استدعاء الإعدادات أولاً وقبل كل شيء
const config = require('./config.json'); 
const prefix = config.prefix;
const owners = config.owners;

// 2. تعريف البوت
const client = new Client({ intents: 32767 });

// 3. منع توقف البوت عند الأخطاء
process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

client.commands = new Collection();
client.slashCommands = new Collection();
client.config = config;
client.prefix = prefix;

// 4. تشغيل الأحداث (الـ Events)
require("./events")(client);

// 5. نقل سطر الـ login ليكون بعد تعريف كل شيء
// (ملاحظة: تأكد أنك حذفت سطر client.login(process.env.DISCORD_TOKEN) من وسط الكود)
Channels : ${client.channels.cache.size}`)
});

client.on('guildCreate', (guild) => {
    if (guild.id !== config.Guild) {
      guild.leave()
  }
  
  });

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(prefix)) return;
  
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
  
    if (command === 'restart') {
      if (!owners.includes(message.author.id)) return message.react('❌');
  
      message.reply('جاري إعادة تشغيل البوت...').then(() => {
        shutdownBot(); // قم بإيقاف البوت أولاً
      });
    }
  });

client.on("ready", () => {
    const botId = client.user.id;
    config.botId = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot`
    fs.writeFile(`${process.cwd()}/config.json`, JSON.stringify(config, null, 4), (err) => {
    });
});

client.on('ready', () => { 
    client.user.setActivity("Angel Temp", {type: "STREAMING", url: "https://twitch.tv/discord"})
  });

client.on('voiceStateUpdate', async (oldState, newState) => {
    const targetVoiceChannelId = db.get(`voiceChannel_${oldState.guild.id}`);
    const tempimg = db.get(`tempimg_${oldState.guild.id}`) || './events/Frawnd.png';

    const { guild } = oldState;
    if (!guild) return;

    const member = newState.member;
    if (!member || member.user.bot) return;

    const targetChannel = guild.channels.cache.get(targetVoiceChannelId);
    if (!targetChannel || !targetChannel.isVoice()) return;

    const userData = db.get(guild.id);

    if (newState.channelId === targetChannel.id) {
        if (member.voice.channelId !== targetChannel.id) return;

        const newVoiceChannel = await guild.channels.create(member.user.username, {
            type: 'GUILD_VOICE',
            parent: targetChannel.parent, 
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                },
            ],
        });

        await member.voice.setChannel(newVoiceChannel);
        const lockButton = new MessageButton()
            .setCustomId(`lock_${member.id}`)
            .setLabel('قفل')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const unlockButton = new MessageButton()
            .setCustomId(`unlock_${member.id}`)
            .setLabel('فتح')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const hideButton = new MessageButton()
            .setCustomId(`hide_${member.id}`)
            .setLabel('اخفى')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const showButton = new MessageButton()
            .setCustomId(`show_${member.id}`)
            .setLabel('إظهار')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const row = new MessageActionRow()
            .addComponents(lockButton, unlockButton, hideButton, showButton);
        
        const adding = new MessageButton()
            .setCustomId(`grace`)
            .setLabel('سماح')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const forbid = new MessageButton()
            .setCustomId(`forbid`)
            .setLabel('منع')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const disconnect = new MessageButton()
            .setCustomId(`disconnect`)
            .setLabel('طرد')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const limet = new MessageButton()
            .setCustomId(`limet`)
            .setLabel('حد')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const row2 = new MessageActionRow()
            .addComponents(adding, forbid, disconnect, limet);
        
        const name = new MessageButton()
            .setCustomId(`name`)
            .setLabel('الإسم')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const mute = new MessageButton()
            .setCustomId(`mute`)
            .setLabel('ميوت')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const unmute = new MessageButton()
            .setCustomId(`unmute`)
            .setLabel('فك')
            .setStyle('SECONDARY')
            .setDisabled(false);
        
        const deletee = new MessageButton()
            .setCustomId(`deletee_${member.id}`)
            .setLabel('حذف')
            .setStyle('DANGER')
            .setDisabled(false);
        
        const row3 = new MessageActionRow()
            .addComponents(name, mute, unmute,deletee);

        await newVoiceChannel.send({ 
            files: [{ attachment: `${tempimg}`, name: "Xion.png" }], 
            components: [row, row2, row3] 
        });

        const message = await newVoiceChannel.send({ content: `يمكنك التحكم في الروم الصوتي من هنا\n<@${member.id}>` });
        setTimeout(() => {
            message.delete();
        }, 10000); // يحذف الرسالة بعد 10 ثواني
                            
        if (!userData) {
            db.set(guild.id, [{ userId: member.id, voiceId: newVoiceChannel.id }]);
        } else {
            userData.push({ userId: member.id, voiceId: newVoiceChannel.id });
            db.set(guild.id, userData);
        }
    } else if (oldState.channelId && !newState.channelId) {
        if (userData) {
            const index = userData.findIndex(data => data.userId === oldState.member.id);
            if (index !== -1) {
                const channel = oldState.guild.channels.cache.get(userData[index].voiceId);
                if (channel && channel.members.size === 0) {
                    await channel.delete();
                    userData.splice(index, 1); 
                    db.set(oldState.guild.id, userData);
                }
            }
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, userId] = interaction.customId.split('_');
    const guild = interaction.guild;

    const guildData = db.get(guild.id);
    if (!guildData) return;

    const userData = guildData.find(data => data.userId === userId);
    if (!userData) return;

    const voiceChannel = guild.channels.cache.get(userData.voiceId);
    if (!voiceChannel || !voiceChannel.isVoice()) return;

    const member = guild.members.cache.get(interaction.user.id);
    if (!member || member.voice.channelId !== voiceChannel.id) return;

    if (action === 'lock') {
        await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            CONNECT: false
        });
        await interaction.reply({ content: `تم قفل القناة بنجاح`, components: [], ephemeral: true });
        await deleteResponse(interaction, 4000);

    } else if (action === 'unlock') {
        await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            CONNECT: true
        });
        await interaction.reply({ content: `تم فتح القناة بنجاح`, components: [], ephemeral: true });
        await deleteResponse(interaction, 4000);

    } else if (action === 'hide') {
        await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            VIEW_CHANNEL: false
        });
        await interaction.reply({ content: `تم إخفاء القناة بنجاح`, components: [], ephemeral: true });
        await deleteResponse(interaction, 4000);

    } else if (action === 'show') {
        await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
            VIEW_CHANNEL: true
        });
        await interaction.reply({ content: `تم إظهار القناة بنجاح`, components: [], ephemeral: true });
        await deleteResponse(interaction, 4000);

    } else if (action === 'deletee') {
        await interaction.reply({ content: `جارٍ حذف الروم...`, ephemeral: true });
        await deleteResponse(interaction, 4000);

        setTimeout(async () => {
            await member.voice.disconnect();
            await voiceChannel.delete();
        }, 5000);
    }
});

const deleteResponse = async (interaction, delay) => {
    setTimeout(async () => {
        try {
            await interaction.deleteReply();
        } catch (error) {
            console.error("حدث خطأ أثناء محاولة حذف الرد:", error);
        }
    }, delay);
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || interaction.channelId !== voiceChannel.id) return;

    if (interaction.customId === "grace") {
        const Services = new Modal().setCustomId(`add`).setTitle(`اضافه شخص`);
        const Service_1 = new TextInputComponent().setCustomId('Ad').setLabel(`ضع إيدي الشخص هنا ؟`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "forbid") {
        const Services = new Modal().setCustomId(`block`).setTitle(`اضافه شخص`);
        const Service_1 = new TextInputComponent().setCustomId('bloc').setLabel(`ضع إيدي الشخص هنا ؟`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "disconnect") {
        const Services = new Modal().setCustomId(`dis`).setTitle(`طرد شخص من الروم الصوتي`);
        const Service_1 = new TextInputComponent().setCustomId('dise').setLabel(`ضع إيدي الشخص؟`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "limet") {
        const Services = new Modal().setCustomId(`limt`).setTitle(`أكتب عدد من 100 ل 1`);
        const Service_1 = new TextInputComponent().setCustomId('dises').setLabel(`أكتب عدد من 100 ل 1`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "add") {
        const Service1 = interaction.fields.getTextInputValue('Ad');
        const Member = await interaction.guild.members.fetch(Service1).catch(() => null);
        if (!Member) return await interaction.reply({ content: `لا يمكن العثور على العضو.`, ephemeral: true });
        
        const channel = interaction.channel;
        await channel.permissionOverwrites.edit(Member, { VIEW_CHANNEL: true, CONNECT: true, SPEAK: true });
        await interaction.reply({ content: `تم السماح لـ ${Member} بالدخول`, ephemeral: true }).catch(() => { });
    } else if (interaction.customId === "block") {
        const Service1 = interaction.fields.getTextInputValue('bloc');
        const Member = await interaction.guild.members.fetch(Service1).catch(() => null);
        if (!Member) return await interaction.reply({ content: `لا يمكن العثور على العضو.`, ephemeral: true });
        
        const channel = interaction.channel;
        await channel.permissionOverwrites.edit(Member, { VIEW_CHANNEL: false, CONNECT: false, SPEAK: false });
        await interaction.reply({ content: `تم منع ${Member} من الدخول`, ephemeral: true }).catch(() => { });
    } else if (interaction.customId === "dis") {
        const memberId = interaction.fields.getTextInputValue('dise');
        const memberToKick = interaction.guild.members.cache.get(memberId);
        if (!memberToKick) return await interaction.reply({ content: `لا يمكن العثور على العضو.`, ephemeral: true });
        await deleteResponse(interaction, 4000);
    
        const authorVoiceChannel = interaction.member.voice.channel;
        const memberVoiceChannel = memberToKick.voice.channel;
    
        if (!memberVoiceChannel || !authorVoiceChannel || memberVoiceChannel.id !== authorVoiceChannel.id) {
            return await interaction.reply({ content: `لا يمكنك طرد هذا الشخص من هذه القناة الصوتية.`, ephemeral: true });
        }
    
        try {
            await memberToKick.voice.disconnect()
            await interaction.reply({ content: `تم طرد ${memberToKick} من الروم الصوتي.`, ephemeral: true });
            await deleteResponse(interaction, 4000);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `\`\`\`.حدث خطأ، يرجى التواصل مع الدعم الفني\`\`\``, ephemeral: true });
            await deleteResponse(interaction, 4000);
        }
        
    } else if (interaction.customId === "limt") {
        const limit = parseInt(interaction.fields.getTextInputValue('dises'));

        if (isNaN(limit) || limit < 0 || limit > 99) {
            await interaction.reply({ content: `\`\`\`.حدث خطأ، يرجى التواصل مع الدعم الفني\`\`\``, ephemeral: true });
            await deleteResponse(interaction, 4000);

        } else {
            const voiceChannel = interaction.member.voice.channel;
            await voiceChannel.setUserLimit(limit);
            await interaction.reply({ content: `العدد المسوح للدخول الآن ${limit}`, ephemeral: true });
            await deleteResponse(interaction, 4000);

        } 
    } else if (interaction.customId === "name") {
        const Services = new Modal().setCustomId(`itsname`).setTitle(`تغيير اسم القناة الصوتية`);
        const Service_1 = new TextInputComponent().setCustomId('newName').setLabel(`أدخل الاسم الجديد للقناة`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "mute") {
        const Services = new Modal().setCustomId(`mutes`).setTitle(`اضافه شخص`);
        const Service_1 = new TextInputComponent().setCustomId('desaas').setLabel(`ضف ايدي الشخص`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.customId === "unmute") {
        const Services = new Modal().setCustomId(`unmut`).setTitle(`اضافه شخص`);
        const Service_1 = new TextInputComponent().setCustomId('desaasa').setLabel(`ضف ايدي الشخص`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true)
        const Service1 = new MessageActionRow().addComponents(Service_1);
        Services.addComponents(Service1);
        interaction.showModal(Services);
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "mutes") {
            const Service1 = interaction.fields.getTextInputValue('desaas');
            const Member = await interaction.guild.members.fetch(Service1).catch(() => null);
            if (!Member) return await interaction.reply({ content: `لا يمكن العثور على العضو.`, ephemeral: true });
            await deleteResponse(interaction, 4000);

            const authorVoiceChannel = interaction.member.voice.channel;
            const memberVoiceChannel = Member.voice.channel;

            if (!memberVoiceChannel || !authorVoiceChannel || memberVoiceChannel.id !== authorVoiceChannel.id) {
                return await interaction.reply({ content: `لا يمكنك منع هذا الشخص في هذه القناة الصوتية.`, ephemeral: true });
            }

            await memberVoiceChannel.permissionOverwrites.edit(Member, { SPEAK: false });
            await interaction.reply({ content: `تم منع الشخص من الحديث.`, ephemeral: true }).catch(() => { });
            await deleteResponse(interaction, 4000);


        } else if (interaction.customId === "unmut") {

            const Service1 = interaction.fields.getTextInputValue('desaasa');
            const Member = await interaction.guild.members.fetch(Service1).catch(() => null);
            if (!Member) return await interaction.reply({ content: `لا يمكن العثور على العضو.`, ephemeral: true });
            await deleteResponse(interaction, 4000);

            const authorVoiceChannel = interaction.member.voice.channel;
            const memberVoiceChannel = Member.voice.channel;

            if (!memberVoiceChannel || !authorVoiceChannel || memberVoiceChannel.id !== authorVoiceChannel.id) {
                return await interaction.reply({ content: `لا يمكنك فك منع هذا الشخص في هذه القناة الصوتية.`, ephemeral: true });
            }

            await memberVoiceChannel.permissionOverwrites.edit(Member, { SPEAK: true });
            await interaction.reply({ content: `تم فك منع الشخص من الحديث.`, ephemeral: true }).catch(() => { });
          
        } else if (interaction.customId === "itsname") {
            const newName = interaction.fields.getTextInputValue('newName');
            if (!newName) {
                await interaction.reply({ content: `\`\`\`.يرجى إدخال اسم جديد للقناة\`\`\``, ephemeral: true });
                await deleteResponse(interaction, 4000);
            } else {
                const voiceChannel = interaction.member.voice.channel;
                await voiceChannel.setName(newName);
                await interaction.reply({ content: `تم تغيير اسم القناة إلى "${newName}"`, ephemeral: true });
                await deleteResponse(interaction, 4000);
            }
        }
    }
});
