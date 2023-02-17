import * as Discord from 'discord.js';
import getUser from './getUser.js';

export default async (guild: Discord.Guild) => {
  const me = await guild.members.fetchMe();
  if (!new Discord.PermissionsBitField(me?.permissions).has(32n)) return null;

  const invites = guild.invites.cache.map((i) => i);
  if (!invites) return null;

  if (!guild.vanityURLCode) return invites;

  const vanityUrl = await guild.fetchVanityData();
  if (!vanityUrl) return invites;

  const client = (await import('../Client.js')).default;
  const owner = await getUser(guild.ownerId);

  invites.push({
    client,
    channel: null,
    channelId: null,
    code: guild.vanityURLCode,
    deletable: false,
    createdAt: null,
    createdTimestamp: new Date().getTime(),
    expiresAt: null,
    expiresTimestamp: null,
    guild,
    inviter: (owner as Discord.User) ?? null,
    inviterId: guild.ownerId,
    maxAge: null,
    maxUses: null,
    memberCount: guild.memberCount,
    presenceCount: guild.approximatePresenceCount ?? 0,
    targetApplication: null,
    targetUser: null,
    targetType: null,
    temporary: false,
    url: `https://discord.gg/${guild.vanityURLCode}`,
    uses: vanityUrl.uses,
    delete: (reason?: string) => {
      throw new Error(`Function not implemented. Reason: ${reason}`);
    },
    toJSON: () => {
      throw new Error('Function not implemented');
    },
    toString: () => {
      throw new Error('Function not implemented');
    },
    valueOf: () => {
      throw new Error('Function not implemented');
    },
    stageInstance: null,
    guildScheduledEvent: null,
  });

  return invites;
};
