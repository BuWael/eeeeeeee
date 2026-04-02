const fs = require('fs');
const { MessageSelectMenu, MessageActionRow, MessageEmbed, MessageButton } = require("discord.js");
const { owners } = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require('pro.db');

module.exports = {
  name: "vip",
  description: "VIP commands",
  run: async (client, message, args) => {

    if (!owners.includes(message.author.id)) return message.react('❌');

    const selectMenu = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('vipMenu')
          .setPlaceholder('اختر إحدى الخيارات')
          .addOptions([
            { label: 'تغير الاسم', emoji: '⚙️', description: 'لتغير إسم البوت', value: 'setname' },
            { label: 'تغيير الصور', emoji: '🖼️', description: 'لتغير صورة البوت', value: 'setavatar' },
            { label: 'تغير الحالة', emoji: '🎭', description: 'لتغير حالة البوت', value: 'setstatus' },
            { label: 'إعادة التشغيل', emoji: '🔄', description: 'إعادة تشغيل البوت', value: 'restr' },
          ])
      );

    const deleteButton = new MessageButton()
      .setCustomId('Cancel')
      .setLabel('إلغاء')
      .setStyle('DANGER');

    const Cancel = new MessageActionRow().addComponents(deleteButton);

    const mainMsg = await message.reply({ content: "**قائمة تعديل البوت ⚙️**", components: [selectMenu, Cancel] });

    const filter = (i) => i.user.id === message.author.id;
    const collector = mainMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === 'Cancel') {
        collector.stop();
        return interaction.message.delete();
      }

      if (interaction.customId === 'vipMenu') {
        const choice = interaction.values[0];

        // --- تغيير الصورة ---
        if (choice === "setavatar") {
          await interaction.message.delete();
          const replyMessage = await message.reply("**يرجى إرفاق الصورة أو رابطها** 🖼️");
          const msgCol = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, max: 1 });
          
          msgCol.on("collect", async (msg) => {
            let url = msg.attachments.first()?.url || msg.content;
            try {
              await client.user.setAvatar(url);
              replyMessage.edit("**تم تغيير صورة البوت بنجاح!** ✅");
            } catch (e) {
              replyMessage.edit("**خطأ: تأكد من الرابط أو حاول لاحقاً (ديسكورد يمنع التغيير السريع).** ❌");
            }
            msg.delete().catch(() => {});
          });
        }

        // --- تغيير الاسم ---
        if (choice === "setname") {
          await interaction.message.delete();
          const setnamereply = await message.reply("**يرجى إرسال اسم البوت الجديد.** ⚙️");
          const msgCol = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, max: 1 });
          
          msgCol.on("collect", async (msg) => {
            try {
              await client.user.setUsername(msg.content);
              setnamereply.edit("**تم تغيير اسم البوت بنجاح!** ✅");
            } catch (e) {
              setnamereply.edit("**خطأ: ديسكورد يمنع تغيير الاسم بكثرة.** ❌");
            }
            msg.delete().catch(() => {});
          });
        }

        // --- إعادة التشغيل ---
        if (choice === "restr") {
          await interaction.update({ content: "**جاري إعادة التشغيل...** 🔄", components: [] });
          client.destroy();
          await client.login(process.env.DISCORD_TOKEN); // التعديل الذهبي
          await interaction.editReply("**تمت إعادة التشغيل بنجاح!** ✅");
        }

        // --- تغيير الحالة ---
        if (choice === "setstatus") {
          await interaction.message.delete();
          const statusMsg = await message.reply("**اكتب الحالة الجديدة (مثلاً: AfterLife On Top)**");
          const msgCol = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, max: 1 });

          msgCol.on("collect", async (msg) => {
            const newStatus = msg.content;
            const row = new MessageActionRow().addComponents(
              new MessageButton().setCustomId('WATCHING').setEmoji('📺').setStyle('SECONDARY'),
              new MessageButton().setCustomId('LISTENING').setEmoji('🎧').setStyle('SECONDARY'),
              new MessageButton().setCustomId('STREAMING').setEmoji('🎥').setStyle('SECONDARY'),
              new MessageButton().setCustomId('PLAYING').setEmoji('🎮').setStyle('SECONDARY')
            );
            
            const btnMsg = await message.reply({ content: `اختر نوع الحالة لـ **${newStatus}**`, components: [row] });
            const btnCol = btnMsg.createMessageComponentCollector({ filter, max: 1 });

            btnCol.on("collect", async (btnInt) => {
              let type = btnInt.customId;
              client.user.setActivity(newStatus, { type: type, url: "https://www.twitch.tv/bw" });
              await btnInt.update({ content: `✅ تم تغيير الحالة إلى **${newStatus}**`, components: [] });
            });
          });
        }
      }
    });
  },
};
