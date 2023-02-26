import type * as Discord from 'discord.js';

export default async (
  msg: Discord.Message | Discord.Message | Discord.Message,
  answer: Discord.Component,
  options: Record<string, string>,
  embed: Discord.APIEmbed,
  page: number,
) =>
  (await import(`${process.cwd()}/dist/Commands/TextCommands/embedbuilder.js`)).builder(
    msg,
    answer,
    embed,
    page,
    options,
  );
