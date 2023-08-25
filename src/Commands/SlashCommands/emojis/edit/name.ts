import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import { GuildEmoji } from '../../../../BaseClient/Other/classes.js';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 if (!cmd.inCachedGuild()) return;

 const name = cmd.options.getString('name', true).replace(/[^a-zA-Z0-9_]/g, '');
 const rawEmoji = Discord.parseEmoji(cmd.options.getString('emoji', true));
 const emoji = rawEmoji?.id ? cmd.guild.emojis.cache.get(rawEmoji.id) : undefined;

 const language = await ch.languageSelector(cmd.guildId);
 const lan = language.slashCommands.emojis;

 if (!emoji) {
  ch.errorCmd(cmd, language.errors.emoteNotFound, await ch.languageSelector(cmd.guildId));
  return;
 }

 const res = await ch.request.guilds.editEmoji(
  cmd.guild,
  emoji.id,
  { name },
  lan.editReason(cmd.user),
 );

 if ('message' in res) {
  ch.errorCmd(cmd, res.message, language);
  return;
 }

 const editedEmote = new GuildEmoji(cmd.client, res, cmd.guild);

 ch.replyCmd(cmd, { content: lan.edited(editedEmote) });
};
