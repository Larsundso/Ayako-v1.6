import * as Discord from 'discord.js';
import * as CT from '../../../Typings/CustomTypings.js';
import constants from '../../Other/constants.js';
import getLogChannels from '../getLogChannels.js';
import send from '../send.js';
import { makeCodeBlock, makeInlineCode } from '../util.js';

import postUpdate from './postUpdate.js';

/**
 * Updates the settings log with the old and new settings and sends an embed to the log channel.
 * @param oldSetting - The old setting object.
 * @param newSetting - The new setting object.
 * @param changedSetting - The key of the changed setting.
 * @param settingName - The name of the setting.
 * @param uniquetimestamp - The unique timestamp.
 * @param guild - The guild object.
 * @param language - The language object.
 * @param lan - The settings language object.
 */
export default async <T extends keyof CT.SettingsNames>(
 oldSetting: { [key in keyof CT.FieldName<T>]: unknown } | undefined,
 newSetting: { [key in keyof CT.FieldName<T>]: unknown } | undefined,
 changedSetting: keyof CT.FieldName<T>,
 settingName: T,
 uniquetimestamp: number | string | undefined,
 guild: Discord.Guild,
 language: CT.Language,
 lan: CT.SettingsNames[T],
) => {
 postUpdate(oldSetting, newSetting, changedSetting, settingName, guild, uniquetimestamp);

 const logs = await getLogChannels('settingslog', guild);
 if (!logs) return;

 const getColor = () => {
  switch (true) {
   case !oldSetting: {
    return constants.colors.success;
   }
   case !newSetting: {
    return constants.colors.danger;
   }
   default: {
    return constants.colors.loading;
   }
  }
 };

 const field =
  (lan.fields[changedSetting as keyof typeof lan.fields] as { name: string }) ??
  ({
   name:
    language.slashCommands.settings[
     changedSetting as keyof CT.Language['slashCommands']['settings']
    ] ?? lan[changedSetting as keyof typeof lan],
  } as { name: string });

 const getFields = (): Discord.APIEmbedField[] => {
  switch (true) {
   case !oldSetting: {
    return [
     {
      name: language.slashCommands.settings.create,
      value: language.slashCommands.settings.log.created(String(settingName)),
     },
    ];
   }
   case !newSetting: {
    return [
     {
      name: language.slashCommands.settings.delete,
      value: language.slashCommands.settings.log.deleted(String(settingName)),
     },
    ];
   }
   default: {
    return [
     {
      name: language.Before,
      value: `${makeInlineCode(field.name)}:\n${
       oldSetting?.[String(changedSetting)]
        ? makeCodeBlock((oldSetting?.[String(changedSetting)] as string) ?? ' ')
        : language.None
      }`,
      inline: false,
     },
     {
      name: language.After,
      value: `${makeInlineCode(field.name)}:\n${
       oldSetting?.[String(changedSetting)]
        ? makeCodeBlock((oldSetting?.[String(changedSetting)] as string) ?? ' ')
        : language.None
      }`,
      inline: false,
     },
    ];
   }
  }
 };

 const embed: Discord.APIEmbed = {
  color: getColor(),
  description: language.slashCommands.settings.log.desc(field.name, lan.name),
  fields: getFields(),
 };

 send({ id: logs, guildId: guild.id }, { embeds: [embed] });
};