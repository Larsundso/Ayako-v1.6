import type * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import type CT from '../../../../Typings/CustomTypings';

export default async (cmd: Discord.RoleSelectMenuInteraction, args: string[]) => {
  const fieldName = args.shift();
  if (!fieldName) return;

  const settingName = args.shift() as keyof CT.TableNamesMap;
  if (!settingName) return;

  const language = await ch.languageSelector(cmd.guildId);
  const lan = language.slashCommands.settings.categories[settingName];

  cmd.update({
    embeds: [
      ch.settingsHelpers.changeHelpers.changeEmbed(
        language,
        lan,
        fieldName,
        cmd.roles.map((c) => c.id),
        'role',
      ),
    ],
  });
};