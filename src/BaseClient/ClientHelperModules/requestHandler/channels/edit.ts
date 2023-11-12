import * as Discord from 'discord.js';
import error from '../../error.js';
import { API } from '../../../Client.js';
import cache from '../../cache.js';
import * as Classes from '../../../Other/classes.js';

/**
 * Edits a guild-based channel or thread channel.
 * @param channel - The channel to edit.
 * @param body - The new channel data.
 * @returns A promise that resolves with the updated channel, or rejects with a DiscordAPIError.
 */
export default async (
 channel: Discord.GuildBasedChannel | Discord.ThreadChannel,
 body: Discord.RESTPatchAPIChannelJSONBody,
) =>
 (cache.apis.get(channel.guild.id) ?? API).channels
  .edit(channel.id, body)
  .then((c) => Classes.Channel(channel.client, c, channel.guild))
  .catch((e) => {
   error(channel.guild, new Error((e as Discord.DiscordAPIError).message));
   return e as Discord.DiscordAPIError;
  });
