import * as Discord from 'discord.js';
// import * as ch from '../../../../BaseClient/ClientHelper.js';
// import type * as CT from '../../../../Typings/CustomTypings';

export default async (_cmd: Discord.ButtonInteraction, _args: string[]) => {
  throw new Error('???');

  return;
  /* 
  const fieldName = args.shift();
  if (!fieldName) return;

  const settingName = args.shift() as keyof CT.TableNamesMap;
  if (!settingName) return;

  const tableName = ch.constants.commands.settings.tableNames[
    settingName as keyof typeof ch.constants.commands.settings.tableNames
  ] as keyof CT.TableNamesMap;
  type SettingsType = CT.TableNamesMap[typeof tableName];

  const linkedSettingName = args.shift() as keyof CT.TableNamesMap;
  if (!linkedSettingName) return;

  const getUniquetimestamp = () => {
    const arg = args.shift();
    if (arg) return Number(arg);
    return undefined;
  };
  const uniquetimestamp = getUniquetimestamp();

  const currentSetting = (await ch.settingsHelpers.changeHelpers.get(
    tableName,
    fieldName,
    cmd.guildId,
    uniquetimestamp,
  )) as SettingsType;

  const language = await ch.languageSelector(cmd.guildId);
  const lan = language.slashCommands.settings.categories[settingName];

  cmd.update({
    embeds: [
      ch.settingsHelpers.changeHelpers.changeEmbed(
        language,
        lan,
        fieldName,
        currentSetting?.[fieldName as keyof typeof currentSetting],
        'settinglink',
      ),
    ],
    components: [
      {
        type: Discord.ComponentType.ActionRow,
        components: [
          ch.settingsHelpers.changeHelpers.back(settingName, Number(uniquetimestamp)),
          ch.settingsHelpers.changeHelpers.done(
            settingName,
            fieldName,
            'settinglink',
            language,
            Number(uniquetimestamp),
          ),
        ],
      },
    ],
  }); */
};