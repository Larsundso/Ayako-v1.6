import type * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';

export default async (payload: { guildId: bigint; roleId: bigint }) => {
  const role = client.ch.cache.roles.cache.get(payload.guild.id)?.get(payload.roleId);
  client.ch.cache.roles.delete(payload.roleId);
  if (!role) return;

  const files: {
    default: (t: { guildId: bigint; roleId: bigint }, r: DDeno.Role) => void;
  }[] = await Promise.all(['./log.js'].map((p) => import(p)));

  files.forEach((f) => f.default(payload, role));
};
