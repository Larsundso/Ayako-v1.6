import type * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';

export default async (emote: Discord.GuildEmoji) => {
  const channels = await client.ch.getLogChannels('emojievents', emote.guild);
  if (!channels) return;

  const language = await client.ch.languageSelector(emote.guild.id);
  const lan = language.events.logs.guild;
  const con = client.customConstants.events.logs.emoji;
  const audit = !emote.author ? await client.ch.getAudit(emote.guild, 60, emote.id) : undefined;
  const auditUser = emote.author ?? (await emote.fetchAuthor()) ?? audit?.executor ?? undefined;
  const files: Discord.AttachmentPayload[] = [];

  const embed: Discord.APIEmbed = {
    author: {
      icon_url: con.create,
      name: lan.emojiCreate,
    },
    description: auditUser
      ? lan.descEmojiCreateAudit(auditUser, emote)
      : lan.descEmojiCreate(emote),
    fields: [],
    color: client.customConstants.colors.success,
  };

  const attachment = (await client.ch.fileURL2Buffer([emote.url]))?.[0];

  if (attachment) {
    files.push(attachment);

    embed.thumbnail = {
      url: `attachment://${client.ch.getNameAndFileType(emote.url)}`,
    };
  }

  client.ch.send(
    { id: channels, guildId: emote.guild.id },
    { embeds: [embed], files },
    language,
    undefined,
    10000,
  );
};
