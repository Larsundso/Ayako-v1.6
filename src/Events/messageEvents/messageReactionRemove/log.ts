import type * as Discord from 'discord.js';
import * as ch from '../../../BaseClient/ClientHelper.js';

export default async (
 reaction: Discord.MessageReaction,
 user: Discord.User,
 msg: Discord.Message,
) => {
 if (!msg.inGuild()) return;

 const channels = await ch.getLogChannels('messageevents', msg.guild);
 if (!channels) return;

 const language = await ch.getLanguage(msg.guildId);
 const lan = language.events.logs.reaction;
 const con = ch.constants.events.logs.reaction;
 const files: Discord.AttachmentPayload[] = [];
 const embeds: Discord.APIEmbed[] = [];

 const embed: Discord.APIEmbed = {
  author: {
   icon_url: con.remove,
   name: lan.nameRemove,
  },
  description: lan.descRemoved(reaction.emoji, user, msg),
  fields: [],
  color: ch.constants.colors.danger,
  timestamp: new Date().toISOString(),
 };

 embeds.push(embed);

 if (msg.reactions.cache.filter((r) => Number(r.count) !== 0)?.size) {
  embeds.push({
   title: lan.reactions,
   description: (msg.reactions.cache ?? [{ count: 0, emoji: reaction.emoji }])
    .filter((r) => Number(r.count) !== 0)
    ?.map(
     (r) =>
      `\`${ch.spaces(`${Number(r.count)}`, 5)}\` ${
       (reaction.emoji.id && r.emoji.id && reaction.emoji.id === r.emoji.id) ||
       (!reaction.emoji.id && reaction.emoji.name === r.emoji.name)
        ? ` ${ch.constants.standard.getEmote(ch.emotes.minusBG)}`
        : ` ${ch.constants.standard.getEmote(ch.emotes.invis)}`
      } ${language.languageFunction.getEmote(r.emoji)}`,
    )
    .join(''),
   color: ch.constants.colors.ephemeral,
  });
 }

 embed.thumbnail = {
  url: `attachment://${ch.getNameAndFileType(ch.constants.standard.emoteURL(reaction.emoji))}`,
 };

 const attachment = (
  await ch.fileURL2Buffer([ch.constants.standard.emoteURL(reaction.emoji)])
 )?.[0];
 if (attachment) files.push(attachment);

 await ch.send({ id: channels, guildId: msg.guildId }, { embeds, files }, undefined, 10000);
};
