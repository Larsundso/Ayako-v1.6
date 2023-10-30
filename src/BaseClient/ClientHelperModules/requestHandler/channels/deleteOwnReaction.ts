import * as Discord from 'discord.js';
// eslint-disable-next-line import/no-cycle
import error from '../../error.js';
import { API } from '../../../Client.js';
import cache from '../../cache.js';

/**
 * Deletes the reaction of the bot on a message.
 * @param message - The message object to delete the reaction from.
 * @param emoji - The emoji to delete from the message.
 * @returns A promise that resolves with the deleted reaction or rejects with an error.
 */
export default (message: Discord.Message<true>, emoji: string) => {
 const resolvedEmoji = Discord.resolvePartialEmoji(emoji);
 if (!resolvedEmoji) {
  return new Discord.DiscordjsTypeError(
   Discord.DiscordjsErrorCodes.EmojiType,
   'emoji',
   'EmojiIdentifierResolvable',
  ) as Discord.DiscordAPIError;
 }

 return (cache.apis.get(message.guild.id) ?? API).channels
  .deleteOwnMessageReaction(
   message.channel.id,
   message.id,
   resolvedEmoji.id
    ? `${resolvedEmoji.animated ? 'a:' : ''}${resolvedEmoji.name}:${resolvedEmoji.id}`
    : (resolvedEmoji.name as string),
  )
  .catch((e) => {
   error(message.guild, new Error((e as Discord.DiscordAPIError).message));
   return e as Discord.DiscordAPIError;
  });
};