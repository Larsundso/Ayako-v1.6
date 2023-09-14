import * as Discord from 'discord.js';
import { request } from './requestHandler.js';

export default async (event: Discord.GuildScheduledEvent) => {
 if (!event.guild) return [];

 const users: { member: Discord.GuildMember | undefined; user: Discord.User }[] = [];

 for (let lastNum = 0; lastNum !== users.length; lastNum = users.length) {
  // eslint-disable-next-line no-await-in-loop
  const u = await request.guilds.getScheduledEventUsers(event.guild, event.id, {
   limit: 100,
   with_member: true,
   after: users.at(-1)?.user.id,
  });

  if ('message' in u) return [];
  u.forEach((m) => users.push(m));
 }

 return users.map((u) => ({
  ...u,
  guildScheduledEventId: event.id,
 }));
};