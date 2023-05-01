import * as Discord from 'discord.js';
import * as ch from '../../../BaseClient/ClientHelper.js';
import type * as CT from '../../../Typings/CustomTypings';

export default async (cmd: Discord.ModalSubmitInteraction) => {
 if (!cmd.isFromMessage()) return;

 const embed = new Discord.EmbedBuilder(cmd.message.embeds[0].data);
 const messageLink = cmd.fields.getTextInputValue('message');
 const [, , , , , channelId, messageId] = messageLink.split('/');

 const guild = cmd.guild;
 if (!guild) return;

 const language = await ch.languageSelector(guild.id);
 const lan = language.slashCommands.embedbuilder.edit;

 const channel = await ch.getChannel.guildTextChannel(channelId);
 if (!channel) {
  noChannelFound(cmd, lan);
  return;
 }

 const message = await channel.messages.fetch(messageId);
 if (!message) {
  noMessageFound(cmd, lan);
  return;
 }

 message.edit({ embeds: [embed] });
 cmd.reply({
  content: lan.edited,
  ephemeral: true,
  components: [
   {
    type: Discord.ComponentType.ActionRow,
    components: [
     {
      type: Discord.ComponentType.Button,
      style: Discord.ButtonStyle.Link,
      label: lan.view,
      url: ch.constants.standard.msgurl(guild.id, channel.id, message.id),
     },
    ],
   },
  ],
 });
};

const noMessageFound = (
 cmd: Discord.ModalSubmitInteraction,
 lan: CT.Language['slashCommands']['embedbuilder']['edit'],
) =>
 cmd.reply({
  content: lan.noMessageFound,
 });

const noChannelFound = (
 cmd: Discord.ModalSubmitInteraction,
 lan: CT.Language['slashCommands']['embedbuilder']['edit'],
) =>
 cmd.reply({
  content: lan.noMessageFound,
 });