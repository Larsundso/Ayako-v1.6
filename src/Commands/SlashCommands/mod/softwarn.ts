import * as Discord from 'discord.js';
import * as CT from '../../../Typings/CustomTypings.js';
import * as ch from '../../../BaseClient/ClientHelper.js';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 if (!cmd.inCachedGuild()) return;

 const user = cmd.options.getUser('user', true);
 const reason = cmd.options.getString('reason', false);

 const language = await ch.getLanguage(cmd.guildId);

 const modOptions: CT.ModOptions<'softWarnAdd'> = {
  reason: reason ?? language.noReasonProvided,
  guild: cmd.guild,
  target: user,
  executor: cmd.user,
  dbOnly: false,
  skipChecks: false,
 };

 ch.mod(cmd, 'softWarnAdd', modOptions);
};
