import * as Discord from 'discord.js';
import { request } from './requestHandler';

export default async (guild: Discord.Guild) => {
 const members: Discord.GuildMember[] = [];

 for (let lastNum = 0; lastNum !== members.length; lastNum = members.length) {
  // eslint-disable-next-line no-await-in-loop
  const u = await request.guilds.getMembers(guild, {
   limit: 1000,
   after: members.at(-1)?.user?.id,
  });

  if ('message' in u) return [];
  u.forEach((m) => members.push(m));
 }

 return members;
};
