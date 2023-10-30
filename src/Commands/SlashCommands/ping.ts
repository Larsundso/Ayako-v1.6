import type * as Discord from 'discord.js';
import * as ch from '../../BaseClient/ClientHelper.js';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 const stats = await ch.DataBase.stats.findFirst();
 const language = await ch.getLanguage(cmd.guildId);
 const lan = language.slashCommands.ping;

 ch.replyCmd(cmd, {
  embeds: [
   {
    description: `**${lan.lastHeartbeat}**: ${ch.util.makeInlineCode(
     String(stats?.heartbeat ?? 0),
    )} ${language.time.milliseconds}`,
    color: ch.getColor(cmd.guild ? await ch.getBotMemberFromGuild(cmd.guild) : undefined),
    author: { name: lan.author },
   },
  ],
 });
};
