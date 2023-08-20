import * as Discord from 'discord.js';
import error from '../error.js';
import { API } from '../../Client.js';
import cache from '../cache.js';

export default {
 getNitroStickers: (guild: Discord.Guild) =>
  (cache.apis.get(guild.id) ?? API).stickers.getNitroStickers().catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
 get: (guild: Discord.Guild, stickerId: string) =>
  (cache.apis.get(guild.id) ?? API).stickers.get(stickerId).catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
};