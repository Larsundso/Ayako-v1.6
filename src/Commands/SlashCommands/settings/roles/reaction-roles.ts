import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as CT from '../../../../Typings/CustomTypings';

const name = 'reaction-roles';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
  if (!cmd.inGuild()) return;

  const language = await ch.languageSelector(cmd.guild?.id);
  const lan = language.slashCommands.settings.categories[name];

  const ID = cmd.options.get('id', false)?.value as string;
  if (ID) {
    showID(cmd, ID, language, lan);
    return;
  }
  showAll(cmd, language, lan);
};

export const showID: NonNullable<CT.SettingsFile<typeof name>['showID']> = async (
  cmd,
  ID,
  language,
  lan,
) => {
  const { buttonParsers, embedParsers } = ch.settingsHelpers;
  const settings = await ch
    .query(
      `SELECT * FROM ${ch.constants.commands.settings.tableNames[name]} WHERE uniquetimestamp = $1;`,
      [parseInt(ID, 36)],
    )
    .then(async (r: CT.TableNamesMap[typeof name][] | null) =>
      r ? r[0] : await ch.settingsHelpers.runSetup<typeof name>(cmd.guildId, name),
    );

  if (cmd.isButton()) {
    cmd.update({
      embeds: await getEmbeds(embedParsers, settings, language, lan),
      components: await getComponents(buttonParsers, settings, language),
    });
    return;
  }

  cmd.reply({
    embeds: await getEmbeds(embedParsers, settings, language, lan),
    components: await getComponents(buttonParsers, settings, language),
    ephemeral: true,
  });
};

export const showAll: NonNullable<CT.SettingsFile<typeof name>['showAll']> = async (
  cmd,
  language,
  lan,
) => {
  const { multiRowHelpers } = ch.settingsHelpers;
  const settings = await ch
    .query(`SELECT * FROM ${ch.constants.commands.settings.tableNames[name]} WHERE guildid = $1;`, [
      cmd.guild?.id,
    ])
    .then((r: CT.TableNamesMap[typeof name][] | null) => r || null);

  const fields = settings?.map((s) => ({
    name: `ID: \`${Number(s.uniquetimestamp).toString(36)}\``,
    value: `${lan.fields.linkedid.name}: ${
      s.linkedid ? Number(s.linkedid).toString(36) : language.None
    }`,
  }));

  const embeds = multiRowHelpers.embeds(fields, language, lan);
  const components = multiRowHelpers.options(language, name);
  multiRowHelpers.noFields(embeds, language);
  multiRowHelpers.components(embeds, components, language, name);

  if (cmd.isButton()) {
    cmd.update({
      embeds,
      components,
    });
    return;
  }
  cmd.reply({
    embeds,
    components,
    ephemeral: true,
  });
};

export const getEmbeds: CT.SettingsFile<typeof name>['getEmbeds'] = (
  embedParsers,
  settings,
  language,
  lan,
) => [
  {
    footer: { text: `ID: ${Number(settings.uniquetimestamp).toString(36)}` },
    author: embedParsers.author(language, lan),
    fields: [
      {
        name: language.slashCommands.settings.active,
        value: embedParsers.boolean(settings?.active, language),
        inline: false,
      },
      {
        name: lan.fields.linkedid.name,
        value: settings.linkedid ? Number(settings.linkedid).toString(36) : language.None,
        inline: false,
      },
      {
        name: lan.fields.emote.name,
        value: settings.emote ?? language.none,
        inline: false,
      },
      {
        name: lan.fields.roles.name,
        value: embedParsers.roles(settings?.roles, language),
        inline: true,
      },
    ],
  },
];

export const getComponents: CT.SettingsFile<typeof name>['getComponents'] = (
  buttonParsers,
  settings,
  language,
) => [
  {
    type: Discord.ComponentType.ActionRow,
    components: [
      buttonParsers.global(
        language,
        !!settings?.active,
        'active',
        name,
        Number(settings?.uniquetimestamp),
      ),
      buttonParsers.back(name, undefined),
      buttonParsers.delete(language, name, Number(settings?.uniquetimestamp)),
    ],
  },
  {
    type: Discord.ComponentType.ActionRow,
    components: [
      buttonParsers.setting(
        language,
        settings?.linkedid,
        'linkedid',
        name,
        'reaction-role-settings',
        Number(settings?.uniquetimestamp),
      ),
      buttonParsers.specific(
        language,
        settings?.emote,
        'emote',
        name,
        Number(settings?.uniquetimestamp),
      ),
      buttonParsers.specific(
        language,
        settings?.roles,
        'roles',
        name,
        Number(settings?.uniquetimestamp),
        'role',
      ),
    ],
  },
];