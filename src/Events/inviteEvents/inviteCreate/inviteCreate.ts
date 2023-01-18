import type * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';

export default async (invite: DDeno.Invite) => {
  if (!invite.guild.id) return;

  const guild = await client.ch.cache.guilds.get(invite.guild.id);
  if (!guild) return;

  const inviteMetadata = await client.helpers.getInvite(invite.code);
  client.ch.cache.invites.set(invite);

  const files: {
    default: (i: DDeno.BaseInvite, g: DDeno.Guild, r: DDeno.Invite) => void;
  }[] = await Promise.all(['./log.js'].map((p) => import(p)));

  files.forEach((f) => f.default(inviteMetadata, guild, invite));
};
