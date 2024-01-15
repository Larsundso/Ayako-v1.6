import type * as Discord from 'discord.js';
import log from './log.js';

export default async (
 msg: Discord.Message,
 reactions: Discord.Collection<string | Discord.Snowflake, Discord.MessageReaction>,
) => {
 if (!msg.inGuild()) return;

 log(msg, reactions);
};