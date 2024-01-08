import * as Discord from 'discord.js';
import { glob } from 'glob';
import SlashCommands from '../../../SlashCommands/index.js';
import * as CT from '../../../Typings/Typings.js';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 const stringCommandFiles = (await getCommand('StringCommands')).filter((c) =>
  c.endsWith(`${c.split(/\/+/g).at(-1)?.replace('.js', '')}.js`),
 );
 const stringCommandsUnfiltered = await Promise.all(stringCommandFiles.map((f) => import(f)));
 const stringCommands = stringCommandsUnfiltered.filter((c) => !!c.name);

 const language = await cmd.client.util.getLanguage(cmd.guildId);
 const lan = language.slashCommands.help;
 const fetchedCommands = cmd.client.application.commands.cache;

 const commands = new Map<
  string,
  {
   categoryName: string;
   commands: string[];
  }
 >();

 const settings = cmd.guildId
  ? await cmd.client.util.DataBase.guildsettings.findUnique({ where: { guildid: cmd.guildId } })
  : undefined;

 Object.entries(SlashCommands.categories).forEach(([key, category]) => {
  if (!commands.has(category)) commands.set(category, { categoryName: category, commands: [] });

  const [commandName] = key.split(/_/g);
  const command = fetchedCommands?.find((o) => o.name === commandName);
  const stringCommand = stringCommands.find((c) => c.name === commandName);

  commands
   .get(category)
   ?.commands.push(
    `${!key.match(/\s|[A-Z]/g) ? `</${key.replace(/_/g, ' ')}:${command?.id}>` : key} ${
     stringCommand
      ? cmd.client.util.util.makeInlineCode(
         `${settings?.prefix ?? cmd.client.util.constants.standard.prefix}${stringCommand.name}`,
        )
      : ''
    }`,
   );
 });

 const commandEmbed: Discord.APIEmbed = {
  color: CT.Colors.Base,
  title: lan.title,
  description: Array.from(commands, ([, c]) => c)
   .map(
    (c) =>
     `**${lan.categories[c.categoryName as keyof typeof lan.categories]}**\n${c.commands
      .map((command) => `${command}`)
      .join('\n')}`,
   )
   .join('\n\n'),
 };

 cmd.client.util.replyCmd(cmd, { embeds: [commandEmbed] });
};

const getCommand = (
 type: 'SlashCommands' | 'StringCommands' | 'ContextCommands',
): Promise<string[]> =>
 glob(`${process.cwd()}${process.cwd().includes('dist') ? '' : '/dist'}/Commands/${type}/**/*`);
