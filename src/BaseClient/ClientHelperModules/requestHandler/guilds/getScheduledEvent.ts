import * as Discord from 'discord.js';
// eslint-disable-next-line import/no-cycle
import error from '../../error.js';
import { API } from '../../../Client.js';
import cache from '../../cache.js';
import * as Classes from '../../../Other/classes.js';

/**
 * Retrieves a scheduled event from the specified guild.
 * @param guild - The guild to retrieve the scheduled event from.
 * @param eventId - The ID of the scheduled event to retrieve.
 * @param query - Optional query parameters to include in the request.
 * @returns A Promise that resolves with the retrieved scheduled event, or rejects with an error.
 */
export default (
 guild: Discord.Guild,
 eventId: string,
 query?: Discord.RESTGetAPIGuildScheduledEventQuery,
) =>
 (cache.apis.get(guild.id) ?? API).guilds
  .getScheduledEvent(guild.id, eventId, query)
  .then((e) => {
   const parsed = new Classes.GuildScheduledEvent(guild.client, e);
   if (guild.scheduledEvents.cache.get(parsed.id)) return parsed;
   guild.scheduledEvents.cache.set(parsed.id, parsed);
   return parsed;
  })
  .catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
   return e as Discord.DiscordAPIError;
  });
