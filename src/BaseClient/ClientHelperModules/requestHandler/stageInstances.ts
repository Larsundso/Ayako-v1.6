import * as Discord from 'discord.js';
import error from '../error.js';
import { API } from '../../Client.js';
import cache from '../cache.js';

export default {
 create: (guild: Discord.Guild, body: Discord.RESTPostAPIStageInstanceJSONBody, reason?: string) =>
  (cache.apis.get(guild.id) ?? API).stageInstances.create(body, { reason }).catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
 get: (guild: Discord.Guild, channelId: string) =>
  (cache.apis.get(guild.id) ?? API).stageInstances.get(channelId).catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
 edit: (
  guild: Discord.Guild,
  channelId: string,
  body: Discord.RESTPatchAPIStageInstanceJSONBody,
  reason?: string,
 ) =>
  (cache.apis.get(guild.id) ?? API).stageInstances.edit(channelId, body, { reason }).catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
 delete: (guild: Discord.Guild, channelId: string, reason?: string) =>
  (cache.apis.get(guild.id) ?? API).stageInstances.delete(channelId, { reason }).catch((e) => {
   error(guild, new Error((e as Discord.DiscordAPIError).message));
  }),
};