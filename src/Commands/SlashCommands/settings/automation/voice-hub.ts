import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import * as CT from '../../../../Typings/CustomTypings.js';
import { TableNamesPrismaTranslation } from '../../../../BaseClient/Other/constants.js';

const name = 'voice-hubs';

export default async (cmd: Discord.ChatInputCommandInteraction) => {
 if (!cmd.inCachedGuild()) return;

 const language = await ch.getLanguage(cmd.guild?.id);
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
 const settings = await ch.DataBase[TableNamesPrismaTranslation[name]]
  .findUnique({
   where: { uniquetimestamp: parseInt(ID, 36) },
  })
  .then(
   (r) =>
    r ??
    (ch.settingsHelpers.setup(
     name,
     cmd.guildId,
     ID ? parseInt(ID, 36) : Date.now(),
    ) as unknown as CT.TableNamesMap[typeof name]),
  );

 if (cmd.isButton()) {
  cmd.update({
   embeds: await getEmbeds(embedParsers, settings, language, lan, cmd.guild),
   components: await getComponents(buttonParsers, settings, language),
  });
  return;
 }

 cmd.reply({
  embeds: await getEmbeds(embedParsers, settings, language, lan, cmd.guild),
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
 const settings = await ch.DataBase[TableNamesPrismaTranslation[name]].findMany({
  where: { guildid: cmd.guildId },
 });

 const fields = settings?.map((s) => ({
  name: `${lan.fields.channelid.name}: ${
   s.channelid
    ? (cmd.client.channels.cache.get(s.channelid) as Discord.GuildTextBasedChannel)?.name ??
      language.t.None
    : language.t.None
  } - ${lan.fields.categoryid.name}: ${
   s.categoryid
    ? (cmd.client.channels.cache.get(s.categoryid) as Discord.CategoryChannel)?.name ??
      language.t.None
    : language.t.None
  }`,
  value: `${
   s.active
    ? ch.constants.standard.getEmote(ch.emotes.enabled)
    : ch.constants.standard.getEmote(ch.emotes.disabled)
  } - ID: \`${Number(s.uniquetimestamp).toString(36)}\``,
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
  description: ch.constants.tutorials[name as keyof typeof ch.constants.tutorials]?.length
   ? `${language.slashCommands.settings.tutorial}\n${ch.constants.tutorials[
      name as keyof typeof ch.constants.tutorials
     ].map((t) => `[${t.name}](${t.link})`)}`
   : undefined,
  author: embedParsers.author(language, lan),
  fields: [
   {
    name: language.slashCommands.settings.active,
    value: embedParsers.boolean(settings?.active, language),
    inline: false,
   },
   {
    name: lan.fields.channelid.name,
    value: embedParsers.channel(settings?.channelid, language),
    inline: true,
   },
   {
    name: lan.fields.categoryid.name,
    value: embedParsers.channel(settings?.categoryid, language),
    inline: true,
   },
   {
    name: lan.fields.deletetime.name,
    value: embedParsers.time(
     settings?.deletetime ? Number(settings.deletetime) * 1000 : null,
     language,
    ),
    inline: true,
   },
   {
    name: '\u200b',
    value: '\u200b',
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
   {
    name: language.slashCommands.settings.blrole,
    value: embedParsers.roles(settings?.blroleid, language),
    inline: false,
   },
   {
    name: language.slashCommands.settings.bluser,
    value: embedParsers.users(settings?.bluserid, language),
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
   buttonParsers.back(name, undefined),
   buttonParsers.global(
    language,
    !!settings?.active,
    'active',
    name,
    Number(settings?.uniquetimestamp),
   ),
   buttonParsers.delete(language, name, Number(settings?.uniquetimestamp)),
  ],
 },
 {
  type: Discord.ComponentType.ActionRow,
  components: [
   buttonParsers.specific(
    language,
    settings?.channelid,
    'channelid',
    name,
    Number(settings?.uniquetimestamp),
    'channel',
   ),
   buttonParsers.specific(
    language,
    settings?.categoryid,
    'categoryid',
    name,
    Number(settings?.uniquetimestamp),
    'channel',
   ),
   buttonParsers.specific(
    language,
    settings?.deletetime,
    'deletetime',
    name,
    Number(settings?.uniquetimestamp),
   ),
  ],
 },
 {
  type: Discord.ComponentType.ActionRow,
  components: [
   buttonParsers.global(
    language,
    settings?.wlroleid,
    'wlroleid',
    name,
    Number(settings?.uniquetimestamp),
   ),
   buttonParsers.global(
    language,
    settings?.wluserid,
    'wluserid',
    name,
    Number(settings?.uniquetimestamp),
   ),
   buttonParsers.global(
    language,
    settings?.blroleid,
    'blroleid',
    name,
    Number(settings?.uniquetimestamp),
   ),
   buttonParsers.global(
    language,
    settings?.bluserid,
    'bluserid',
    name,
    Number(settings?.uniquetimestamp),
   ),
  ],
 },
];