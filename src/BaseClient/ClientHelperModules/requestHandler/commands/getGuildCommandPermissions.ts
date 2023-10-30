import * as Discord from 'discord.js';
import { API } from '../../../Client.js';
import { guild as getBotIdFromGuild } from '../../getBotIdFrom.js';
// eslint-disable-next-line import/no-cycle
import cache from '../../cache.js';
import error from '../../error.js';

/**
 * Retrieves the permissions for a specific command in a guild.
 * @param guild - The guild where the command is located.
 * @param commandId - The ID of the command to retrieve permissions for.
 * @returns A promise that resolves with the command permissions, or rejects with a DiscordAPIError.
 */
export default async (guild: Discord.Guild, commandId: string) =>
 (cache.apis.get(guild.id) ?? API).applicationCommands
  .getGuildCommandPermissions(await getBotIdFromGuild(guild), guild.id, commandId)
  .catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
   return e as Discord.DiscordAPIError;
  });
