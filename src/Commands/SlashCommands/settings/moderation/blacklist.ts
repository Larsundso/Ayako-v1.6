import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as CT from '../../../../Typings/CustomTypings';

const name = 'blacklist';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 if (!cmd.inGuild()) return;

 const language = await ch.languageSelector(cmd.guild?.id);
 const lan = language.slashCommands.settings.categories[name];
 const { embedParsers, buttonParsers } = ch.settingsHelpers;
 const settings = await ch
  .query(`SELECT * FROM ${ch.constants.commands.settings.tableNames[name]} WHERE guildid = $1;`, [
   cmd.guild?.id,
  ])
  .then(async (r: CT.TableNamesMap[typeof name][] | null) =>
   r ? r[0] : ch.settingsHelpers.runSetup<typeof name>(cmd.guildId, name),
  );

 cmd.reply({
  embeds: await getEmbeds(embedParsers, settings, language, lan),
  components: await getComponents(buttonParsers, settings, language),
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
  author: embedParsers.author(language, lan),
  description: `${
   ch.constants.tutorials[name as keyof typeof ch.constants.tutorials]?.length
    ? `${language.slashCommands.settings.tutorial}\n${ch.constants.tutorials[
       name as keyof typeof ch.constants.tutorials
      ].map((t) => `[${t.name}](${t.link})`)}`
    : ''
  }\n\n${
   settings?.words?.length
    ? `${lan.fields.words.name} ${ch.util.makeCodeBlock(settings.words.join(' # '))}`
    : language.None
  }`,
  fields: [
   {
    name: language.slashCommands.settings.active,
    value: embedParsers.boolean(settings?.active, language),
    inline: false,
   },
   {
    name: lan.fields.usestrike.name,
    value: embedParsers.boolean(settings?.usestrike, language),
    inline: true,
   },
   {
    name: '\u200b',
    value: '\u200b',
    inline: false,
   },
   {
    name: language.slashCommands.settings.wlchannel,
    value: embedParsers.channels(settings?.wlchannelid, language),
    inline: false,
   },
   {
    name: language.slashCommands.settings.wlrole,
    value: embedParsers.roles(settings?.wlroleid, language),
    inline: false,
   },
   {
    name: language.slashCommands.settings.wluser,
    value: embedParsers.users(settings?.wluserid, language),
    inline: false,
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
   buttonParsers.global(language, !!settings?.active, 'active', name, undefined),
   buttonParsers.boolean(language, settings?.usestrike, 'usestrike', name, undefined),
  ],
 },
 {
  type: Discord.ComponentType.ActionRow,
  components: [buttonParsers.specific(language, settings?.words, 'words', name, undefined)],
 },
 {
  type: Discord.ComponentType.ActionRow,
  components: [
   buttonParsers.global(language, settings?.wlchannelid, 'wlchannelid', name, undefined),
   buttonParsers.global(language, settings?.wlroleid, 'wlroleid', name, undefined),
   buttonParsers.global(language, settings?.wluserid, 'wluserid', name, undefined),
  ],
 },
];
