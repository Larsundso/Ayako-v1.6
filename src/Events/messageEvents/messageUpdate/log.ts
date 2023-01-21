import * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';
import type CT from '../../../Typings/CustomTypings';

export default async (oldMsg: Discord.Message, msg: Discord.Message) => {
  if (!msg.guild) return;

  const channels = await client.ch.getLogChannels('messageevents', msg.guild);
  if (!channels) return;

  const language = await client.ch.languageSelector(msg.guild.id);
  const lan = language.events.logs.message;
  const con = client.customConstants.events.logs.message;
  const files: Discord.AttachmentPayload[] = [];
  let byAuthor: boolean | null = true;

  const embed: Discord.APIEmbed = {
    author: {
      icon_url: con.delete,
      name: lan.nameDelete,
    },
    fields: [],
    color: client.customConstants.colors.warning,
  };

  const merge = (before: unknown, after: unknown, type: CT.AcceptedMergingTypes, name: string) =>
    client.ch.mergeLogging(before, after, type, embed, language, name);

  switch (true) {
    case oldMsg.flags !== msg.flags: {
      const oldFlags = new Discord.MessageFlagsBitField(oldMsg.flags).toArray();
      const newFlags = new Discord.MessageFlagsBitField(msg.flags).toArray();

      const added = (
        client.ch.getDifference(oldFlags, newFlags) as Discord.MessageFlagsString[]
      ).map((f) => lan.flags[f]);
      const removed = (
        client.ch.getDifference(newFlags, oldFlags) as Discord.MessageFlagsString[]
      ).map((f) => lan.flags[f]);

      merge(added, removed, 'difference', language.Flags);
      break;
    }
    case JSON.stringify(oldMsg.components) !== JSON.stringify(msg.components) &&
      !!oldMsg.components?.length: {
      if (!oldMsg.components?.length) break;

      const components = client.ch.txtFileWriter(
        oldMsg.components.map((c) => JSON.stringify(c, null, 2)),
        undefined,
        lan.components,
      );

      if (components) files.push(components);
      break;
    }
    case oldMsg.editedTimestamp !== msg.editedTimestamp: {
      merge(
        oldMsg.editedTimestamp
          ? client.customConstants.standard.getTime(oldMsg.editedTimestamp)
          : language.none,
        msg.editedTimestamp
          ? client.customConstants.standard.getTime(msg.editedTimestamp)
          : language.none,
        'string',
        lan.editedTimestamp,
      );
      break;
    }
    case oldMsg.activity?.type !== msg.activity?.type: {
      merge(
        oldMsg.activity ? lan.activity[oldMsg.activity?.type] : language.none,
        msg.activity ? lan.activity[msg.activity?.type] : language.none,
        'string',
        language.Flags,
      );

      byAuthor = false;
      break;
    }
    case oldMsg.thread?.id !== msg.thread?.id: {
      merge(
        oldMsg.thread
          ? language.languageFunction.getChannel(
              oldMsg.thread,
              language.channelTypes[oldMsg.thread.type],
            )
          : language.none,
        msg.thread
          ? language.languageFunction.getChannel(msg.thread, language.channelTypes[msg.thread.type])
          : language.none,
        'string',
        language.channelTypes[(msg.thread ?? oldMsg.thread)?.type ?? 11],
      );

      byAuthor = false;
      break;
    }
    case JSON.stringify(oldMsg.stickers) !== JSON.stringify(msg.stickers): {
      const oldStickers = client.ch.getDifference(
        oldMsg.stickers.map((o) => o) ?? [],
        msg.stickers.map((o) => o) ?? [],
      );
      const newStickers = client.ch.getDifference(
        msg.stickers.map((o) => o) ?? [],
        oldMsg.stickers.map((o) => o) ?? [],
      );

      merge(oldStickers, newStickers, 'difference', lan.stickers);
      break;
    }
    case oldMsg.type !== msg.type: {
      merge(lan.type[oldMsg.type], lan.type[msg.type], 'string', language.Type);

      byAuthor = false;
      break;
    }
    case oldMsg.content !== msg.content: {
      if (oldMsg.content?.length > 2000) {
        const content = client.ch.txtFileWriter(oldMsg.content, undefined, language.content);
        if (content) files.push(content);
      } else {
        embed.fields?.push({
          name: lan.beforeContent,
          value: oldMsg.content ?? language.none,
        });
      }

      if (msg.content?.length > 2000) {
        const content = client.ch.txtFileWriter(msg.content, undefined, language.content);
        if (content) files.push(content);
      } else {
        embed.fields?.push({
          name: lan.afterContent,
          value: msg.content ?? language.none,
        });
      }
      break;
    }
    case JSON.stringify(oldMsg.embeds.map((o) => o)) !== JSON.stringify(msg.embeds.map((o) => o)): {
      if (!msg.embeds.length) byAuthor = null;

      if (!oldMsg.embeds?.length) break;

      const embedFile = client.ch.txtFileWriter(
        JSON.stringify(oldMsg.embeds, null, 2),
        undefined,
        language.Embeds,
      );
      if (embedFile) files.push(embedFile);
      break;
    }
    case msg.mentions.everyone !== oldMsg.mentions.everyone: {
      merge(oldMsg.mentions.everyone, msg.mentions.everyone, 'boolean', lan.mentionEveryone);
      break;
    }
    case JSON.stringify(oldMsg.attachments.map((o) => o)) !==
      JSON.stringify(msg.attachments.map((o) => o)): {
      if (!msg.attachments.size) byAuthor = null;

      const oldAttachments = client.ch.getDifference(
        oldMsg.attachments.map((o) => o) ?? [],
        msg.attachments.map((o) => o) ?? [],
      );

      const attachments = (await client.ch.fileURL2Buffer(oldAttachments.map((a) => a.url))).filter(
        (e): e is Discord.AttachmentPayload => !!e,
      );

      if (attachments?.length) files.push(...attachments);
      break;
    }
    case JSON.stringify(oldMsg.mentions.users.map((o) => o)) !==
      JSON.stringify(msg.mentions.users.map((o) => o)): {
      const oldMentions = client.ch.getDifference(
        oldMsg.mentions.users.map((o) => o),
        msg.mentions.users.map((o) => o),
      );
      const newMentions = client.ch.getDifference(
        msg.mentions.users.map((o) => o),
        oldMsg.mentions.users.map((o) => o),
      );

      merge(
        oldMentions.map((i) => `<@${i}>`).join(', '),
        newMentions.map((i) => `<@${i}>`).join(', '),
        'string',
        lan.mentionedUsers,
      );
      break;
    }
    case JSON.stringify(oldMsg.mentions.roles.map((o) => o)) !==
      JSON.stringify(msg.mentions.roles.map((o) => o)): {
      const oldMentions = client.ch.getDifference(
        oldMsg.mentions.roles.map((o) => o),
        msg.mentions.roles.map((o) => o),
      );
      const newMentions = client.ch.getDifference(
        msg.mentions.roles.map((o) => o),
        oldMsg.mentions.roles.map((o) => o),
      );

      merge(
        oldMentions.map((i) => `<@&${i}>`).join(', '),
        newMentions.map((i) => `<@&${i}>`).join(', '),
        'string',
        lan.mentionedRoles,
      );
      break;
    }
    case JSON.stringify(oldMsg.mentions.channels.map((o) => o)) !==
      JSON.stringify(msg.mentions.channels.map((o) => o)): {
      const oldMentions = client.ch.getDifference(
        oldMsg.mentions.channels.map((o) => o),
        msg.mentions.channels.map((o) => o),
      );
      const newMentions = client.ch.getDifference(
        msg.mentions.channels.map((o) => o),
        oldMsg.mentions.channels.map((o) => o),
      );

      merge(
        oldMentions.map((i) => `<#${i}>`).join(', '),
        newMentions.map((i) => `<#${i}>`).join(', '),
        'string',
        lan.mentionedChannels,
      );
      break;
    }
    default: {
      return;
    }
  }

  if (byAuthor === null) {
    embed.description = lan.descUpdateMaybe(msg);
  } else if (byAuthor === false) {
    embed.description = lan.descUpdate(msg);
  } else embed.description = lan.descUpdateAuthor(msg);

  client.ch.send(
    { id: channels, guildId: msg.guild.id },
    { embeds: [embed], files },
    language,
    undefined,
    files.length ? undefined : 10000,
  );
};
