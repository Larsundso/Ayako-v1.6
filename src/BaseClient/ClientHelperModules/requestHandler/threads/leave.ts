import * as Discord from 'discord.js';
// eslint-disable-next-line import/no-cycle
import error from '../../error.js';
import { API } from '../../../Client.js';
import cache from '../../cache.js';

/**
 * Leaves a thread in a guild.
 * @param guild - The guild where the thread is located.
 * @param threadId - The ID of the thread to leave.
 * @returns A promise that resolves with the DiscordAPIError if an error occurs, otherwise void.
 */
export default (guild: Discord.Guild, threadId: string) =>
 (cache.apis.get(guild.id) ?? API).threads.leave(threadId).catch((e) => {
  error(guild, new Error((e as Discord.DiscordAPIError).message));
  return e as Discord.DiscordAPIError;
 });
