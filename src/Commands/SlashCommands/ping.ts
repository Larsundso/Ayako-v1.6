import type * as Discord from 'discord.js';
import * as ch from '../../BaseClient/ClientHelper.js';
import * as DBT from '../../Typings/DataBaseTypings.js';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 const stats = await ch
  .query(`SELECT * FROM stats;`)
  .then((r: DBT.stats[] | null) => r?.[0] ?? null);
 const language = await ch.languageSelector(cmd.guildId);
 const lan = language.slashCommands.ping;

 ch.replyCmd(cmd, {
  embeds: [
   {
    description: `**${lan.lastHeartbeat}**: ${ch.util.makeInlineCode(
     String(stats?.heartbeat ?? 0),
    )} ${language.time.milliseconds}`,
    color: ch.colorSelector(cmd.guild?.members.me),
    author: { name: lan.author },
   },
  ],
 });
};