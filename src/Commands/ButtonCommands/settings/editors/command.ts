import * as Discord from 'discord.js';
import { glob } from 'glob';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import * as CT from '../../../../Typings/Typings.js';

export default async (cmd: Discord.ButtonInteraction, args: string[]) => {
 if (!cmd.inCachedGuild()) return;

 const fieldName = args.shift();
 if (!fieldName) return;

 const settingName = args.shift() as CT.SettingNames;
 if (!settingName) return;

 const getUniquetimestamp = () => {
  const arg = args.shift();
  if (arg) return Number(arg);
  return undefined;
 };
 const uniquetimestamp = getUniquetimestamp();

 const currentSetting = await ch.settingsHelpers.changeHelpers.get(
  settingName,
  cmd.guildId,
  uniquetimestamp,
 );

 const language = await ch.getLanguage(cmd.guildId);

 const commands: Discord.APISelectMenuOption[] = [
  ...(await getStringCommands()).map((c) => ({
   label: c,
   value: c,
  })),
 ].filter((c) => !ch.constants.commands.interactions.find((i) => i.name === c.value));

 commands.push({
  label: language.slashCommands.rp.button,
  value: 'interactions',
 });

 cmd.update({
  embeds: [
   await ch.settingsHelpers.changeHelpers.changeEmbed(
    language,
    settingName,
    fieldName,
    currentSetting?.[fieldName as keyof typeof currentSetting],
    CT.EditorTypes.Commands,
    cmd.guild,
   ),
  ],
  components: [
   {
    type: Discord.ComponentType.ActionRow,
    components: [
     ch.settingsHelpers.changeHelpers.changeSelect(
      fieldName,
      settingName,
      CT.EditorTypes.Commands,
      {
       options: commands.map((c) => ({
        label: c.label,
        value: c.value,
        default: c.value === currentSetting?.[fieldName as keyof typeof currentSetting],
       })),
      },
      uniquetimestamp,
     ),
    ],
   },
   {
    type: Discord.ComponentType.ActionRow,
    components: [
     ch.settingsHelpers.changeHelpers.back(settingName, Number(uniquetimestamp)),
     ch.settingsHelpers.changeHelpers.done(
      settingName,
      fieldName,
      CT.EditorTypes.Commands,
      language,
      Number(uniquetimestamp),
     ),
    ],
   },
  ],
 });
};

const getStringCommands = async (): Promise<string[]> => {
 const files = await glob(
  `${process.cwd()}${process.cwd().includes('dist') ? '' : '/dist'}/Commands/StringCommands/**/*`,
 );

 return files
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.split('/').pop()?.slice(0, -3) as string);
};
