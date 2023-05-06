import type * as Discord from 'discord.js';
import log from './log.js';
import cache from './cache.js';

export default async (guild: Discord.Guild) => {
 log(guild);
 cache(guild);
};
