import * as Discord from 'discord.js';
// eslint-disable-next-line import/no-cycle
import error from '../../error.js';
import { API } from '../../../Client.js';
import cache from '../../cache.js';
import * as Classes from '../../../Other/classes.js';

/**
 * Creates a webhook for a given guild and channel with the provided data.
 * @param guild - The guild where the webhook will be created.
 * @param channelId - The ID of the channel where the webhook will be created.
 * @param body - The data to be sent in the request body.
 * @returns A promise that resolves with a new Webhook object if successful,
 * or rejects with a DiscordAPIError if unsuccessful.
 */
export default async (
 guild: Discord.Guild,
 channelId: string,
 body: Discord.RESTPostAPIChannelWebhookJSONBody,
) =>
 (cache.apis.get(guild.id) ?? API).channels
  .createWebhook(channelId, {
   ...body,
   avatar: body.avatar ? await Discord.DataResolver.resolveImage(body.avatar) : body.avatar,
  })
  .then((w) => new Classes.Webhook(guild.client, w))
  .catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
   return e as Discord.DiscordAPIError;
  });