import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';
import * as SettingsFile from '../../../SlashCommands/settings/moderation/blacklist-rules.js';
import CT from '../../../../Typings/CustomTypings.js';
import { getAPIRule } from '../../../ButtonCommands/settings/autoModRule/boolean.js';

const settingName = 'blacklist-rules';

export default async (cmd: Discord.ModalSubmitInteraction, args: string[]) => {
 if (!cmd.inCachedGuild()) return;
 if (!cmd.isFromMessage()) return;

 args.shift();

 const language = await ch.languageSelector(cmd.guildId);
 const field = cmd.fields.fields.first();
 if (!field) {
  ch.errorCmd(cmd, language.errors.inputNoMatch, language);
  return;
 }

 const newSetting = field.value;

 const getID = () => {
  const arg = args.shift();
  if (arg) return arg;
  return undefined;
 };
 const id = getID();
 if (!id) {
  ch.error(cmd.guild, new Error('No ID found'));
  return;
 }

 const rule = cmd.guild.autoModerationRules.cache.get(id);
 if (!rule) {
  ch.errorCmd(cmd, language.errors.automodRuleNotFound, language);
  return;
 }

 const updatedSetting = await ch.request.guilds.editAutoModerationRule(rule.guild, rule.id, {
  actions: [
   ...getAPIRule(rule).actions.filter(
    (a) => a.type !== Discord.AutoModerationActionType.BlockMessage,
   ),
   {
    type: Discord.AutoModerationActionType.BlockMessage,
    metadata: {
     custom_message: newSetting,
    },
   },
  ],
 });

 if ('message' in updatedSetting) {
  ch.errorCmd(cmd, updatedSetting.message, language);
  return;
 }

 ch.settingsHelpers.updateLog(
  {
   customMessage:
    rule.actions.find((a) => a.type === Discord.AutoModerationActionType.BlockMessage)?.metadata
     .customMessage || language.events.logs.automodRule.defaultMessage,
  } as never,
  {
   customMessage:
    updatedSetting.actions.find((a) => a.type === Discord.AutoModerationActionType.BlockMessage)
     ?.metadata.customMessage || language.events.logs.automodRule.defaultMessage,
  } as never,
  'customMessage' as CT.Argument<(typeof ch)['settingsHelpers']['updateLog'], 2>,
  settingName,
  id,
  cmd.guild,
  language,
  language.slashCommands.settings.categories[settingName],
 );

 const settingsFile = (await ch.settingsHelpers.getSettingsFile(
  settingName,
  cmd.guild,
 )) as unknown as typeof SettingsFile;
 if (!settingsFile) return;

 cmd.update({
  embeds: settingsFile.getEmbeds(
   ch.settingsHelpers.embedParsers,
   updatedSetting,
   language,
   language.slashCommands.settings.categories[settingName],
  ),
  components: settingsFile.getComponents(
   rule,
   language,
   language.slashCommands.settings.categories[settingName],
  ),
 });
};
