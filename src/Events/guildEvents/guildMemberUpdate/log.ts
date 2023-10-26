import * as Discord from 'discord.js';
import * as ch from '../../../BaseClient/ClientHelper.js';
import type CT from '../../../Typings/CustomTypings.js';

export default async (oldMember: Discord.GuildMember, member: Discord.GuildMember) => {
 const channels = await ch.getLogChannels('memberevents', member.guild);
 if (!channels) return;

 const language = await ch.getLanguage(member.guild.id);
 const lan = language.events.logs.guild;
 const con = ch.constants.events.logs.guild;
 const audit = member.user.bot ? await ch.getAudit(member.guild, 20, member.user.id) : undefined;
 const auditUser = audit?.executor ?? undefined;
 let description = '';

 if (member.user.bot) {
  if (audit && auditUser) description = lan.descBotUpdateAudit(member.user, auditUser);
  else description = lan.descBotUpdate(member.user);
 } else if (audit && auditUser) description = lan.descMemberUpdateAudit(member.user, auditUser);
 else description = lan.descMemberUpdate(member.user);

 const embed: Discord.APIEmbed = {
  author: {
   icon_url: member.user.bot ? con.BotUpdate : con.MemberUpdate,
   name: member.user.bot ? lan.botUpdate : lan.memberUpdate,
  },
  description,
  fields: [],
  color: ch.constants.colors.loading,
  timestamp: new Date().toISOString(),
 };

 const files: Discord.AttachmentPayload[] = [];
 const merge = (before: unknown, after: unknown, type: CT.AcceptedMergingTypes, name: string) =>
  ch.mergeLogging(before, after, type, embed, language, name);

 if (member.avatar !== oldMember.avatar) {
  const getImage = async () => {
   const url = member.displayAvatarURL({ size: 4096 });

   if (!url) {
    embed.fields?.push({
     name: lan.avatar,
     value: lan.avatarRemoved,
    });
    return;
   }

   const attachment = (await ch.fileURL2Buffer([url]))?.[0];

   merge(url, ch.getNameAndFileType(url), 'icon', lan.avatar);

   if (attachment) files.push(attachment);
  };

  await getImage();
 }
 if (member.nickname !== oldMember.nickname) {
  merge(oldMember.displayName, member.displayName, 'string', language.name);
 }
 if (member.premiumSinceTimestamp !== oldMember.premiumSinceTimestamp) {
  merge(
   oldMember.premiumSince
    ? ch.constants.standard.getTime(oldMember.premiumSince.getTime())
    : language.None,
   member.premiumSince
    ? ch.constants.standard.getTime(member.premiumSince.getTime())
    : language.None,

   'string',
   lan.premiumSince,
  );
 }
 if (member.communicationDisabledUntilTimestamp !== oldMember.communicationDisabledUntilTimestamp) {
  merge(
   oldMember.communicationDisabledUntil
    ? ch.constants.standard.getTime(oldMember.communicationDisabledUntil.getTime())
    : language.None,
   member.communicationDisabledUntil
    ? ch.constants.standard.getTime(member.communicationDisabledUntil.getTime())
    : language.None,
   'string',
   lan.communicationDisabledUntil,
  );
 }
 if (
  JSON.stringify(member.roles.cache.map((r) => r.id)) !==
  JSON.stringify(oldMember.roles.cache.map((r) => r.id))
 ) {
  const addedRoles = ch.getDifference(
   member.roles.cache.map((r) => r),
   oldMember.roles.cache.map((r) => r),
  );
  const removedRoles = ch.getDifference(
   oldMember.roles.cache.map((r) => r),
   member.roles.cache.map((r) => r),
  );

  merge(
   addedRoles.length ? addedRoles.map((r) => `<@&${r.id}>`).join(', ') : undefined,
   removedRoles.length ? removedRoles.map((r) => `<@&${r.id}>`).join(', ') : undefined,
   'difference',
   language.Roles,
  );
 }
 if (!!member.pending !== !!oldMember.pending) {
  merge(oldMember.pending, member.pending, 'boolean', lan.pending);
 }

 if (member.flags !== oldMember.flags) {
  const oldFlags = new Discord.GuildMemberFlagsBitField(oldMember.flags).toArray();
  const newFlags = new Discord.GuildMemberFlagsBitField(member.flags).toArray();

  const addedFlags = ch.getDifference(newFlags, oldFlags);
  const removedFlags = ch.getDifference(oldFlags, newFlags);

  if (addedFlags.length) {
   embed.fields?.push({
    name: lan.memberFlagsName,
    value: addedFlags
     .map((t) => lan.memberFlags[t as unknown as Discord.GuildMemberFlagsString])
     .join(', '),
   });
  }

  if (removedFlags.length) {
   embed.fields?.push({
    name: lan.memberFlagsName,
    value: removedFlags
     .map((t) => lan.memberFlags[t as unknown as Discord.GuildMemberFlagsString])
     .join(', '),
   });
  }
 }

 ch.send({ id: channels, guildId: member.guild.id }, { embeds: [embed], files }, undefined, 10000);
};
