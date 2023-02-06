import type * as Discord from 'discord.js';
import client from '../../../../BaseClient/Client.js';

export default async (event: Discord.GuildScheduledEvent, user: Discord.User) => {
  client.cache.scheduledEventUsers.remove(user, event.guildId, event.id);

  const files: {
    default: (p: Discord.GuildScheduledEvent, a: Discord.User) => void;
  }[] = await Promise.all(['./log.js'].map((p) => import(p)));

  files.forEach((f) => f.default(event, user));
};