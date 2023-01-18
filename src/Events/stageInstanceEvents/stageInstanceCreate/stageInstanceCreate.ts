import type * as Discord from 'discord.js';
import client from '../../../BaseClient/Client.js';

export default async (data: { id: bigint; guildId: bigint; channelId: bigint; topic: string }) => {
  const channel = await client.ch.cache.channels.get(data.channelId, data.guild.id);
  if (!channel) return;

  const cache = await client.ch.cache.stageInstances.get(data.id, data.guild.id);
  if (!cache) return;

  const files: {
    default: (p: DDeno.StageInstance) => void;
  }[] = await Promise.all(['./log.js'].map((p) => import(p)));

  files.forEach((f) => f.default(cache));
};
