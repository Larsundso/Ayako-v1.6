import type * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';

export default async (invite: DDeno.InviteMetadata, guild: DDeno.Guild) => {
  const channels = await client.ch.getLogChannels('guildevents', { guildId: guild.id });
  if (!channels) return;

  const language = await client.ch.languageSelector(invite.guild.id);
  const lan = language.events.logs.invite;
  const con = client.customConstants.events.logs.invite;
  const audit = await client.ch.getAudit(
    guild,
    40,
    undefined,
    (i: DDeno.AuditLogEntry) => i.changes?.find((c) => c.key === 'code')?.new === invite.code,
  );
  const auditUser =
    audit && audit.userId ? await client.users.fetch(audit.userId) : undefined;

  const embed: Discord.APIEmbed = {
    author: {
      icon_url: con.delete,
      name: lan.nameDelete,
    },
    description: auditUser ? lan.descDeleteAudit(auditUser, invite) : lan.descDelete(invite),
    fields: [],
    color: client.customConstants.colors.success,
  };

  const flagsText = [invite.temporary ? lan.temporary : null]
    .filter((f): f is string => !!f)
    .map((f) => `\`${f}\``)
    .join(', ');

  if (flagsText) {
    embed.fields?.push({
      name: lan.flagsName,
      value: flagsText,
      inline: true,
    });
  }

  if (invite.inviter) {
    embed.fields?.push({
      name: lan.inviter,
      value: language.languageFunction.getUser(invite.inviter),
    });
  }

  if (invite.targetUser) {
    embed.fields?.push({
      name: lan.targetUser,
      value: language.languageFunction.getUser(invite.targetUser),
    });
  }

  if (invite.channelId && invite.guild.id) {
    const channel = await client.ch.cache.channels.get(
      BigInt(invite.channelId),
      BigInt(invite.guild.id),
    );

    if (channel) {
      embed.fields?.push({
        name: language.Channel,
        value: language.languageFunction.getChannel(channel, language.channelTypes[channel.type]),
      });
    }
  }

  if (invite.targetType) {
    embed.fields?.push({
      name: lan.targetTypeName,
      value: lan.targetType[invite.targetType],
    });
  }

  embed.fields?.push(
    {
      name: language.createdAt,
      value: client.customConstants.standard.getTime(invite.createdAt),
    },
    {
      name: lan.maxAge,
      value: client.ch.moment(invite.maxAge, language),
    },
    {
      name: lan.maxUses,
      value: String(invite.maxUses) ?? '∞',
    },
  );

  client.ch.send(
    { id: channels, guildId: guild.id },
    { embeds: [embed] },
    language,
    undefined,
    10000,
  );
};
