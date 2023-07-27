import * as Discord from 'discord.js';
import * as ch from '../../../../BaseClient/ClientHelper.js';

const settingName = 'blacklist-rules';

export default async (cmd: Discord.ButtonInteraction, args: string[]) => {
 if (!cmd.inCachedGuild()) return;

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

 const language = await ch.languageSelector(cmd.guildId);
 const rule = cmd.guild.autoModerationRules.cache.get(id);
 if (!rule) {
  ch.errorCmd(cmd, language.errors.automodRuleNotFound, language);
  return;
 }


 cmd.update({
  embeds: [
   await ch.settingsHelpers.changeHelpers.changeEmbed(
    language,
    settingName,
    'exemptChannels',
    rule.exemptChannels.map((c) => c.id),
    'channel',
   ),
  ],
  components: [
   {
    type: Discord.ComponentType.ActionRow,
    components: [
     ch.settingsHelpers.changeHelpers.changeSelectGlobal(
      language,
      'channel',
      'autoModRule/channels',
      settingName,
      id,
     ),
    ],
   },
   {
    type: Discord.ComponentType.ActionRow,
    components: [
     {
      type: Discord.ComponentType.Button,
      style: Discord.ButtonStyle.Danger,
      custom_id: `settings/autoModRule/display_${id}`,
      emoji: ch.objectEmotes.back,
     },
     ch.settingsHelpers.changeHelpers.done(
      settingName,
      'channel',
      'autoModRule/channels',
      language,
      id,
     ),
     ch.settingsHelpers.changeHelpers.makeEmpty(
      settingName,
      'exemptChannels',
      'autoModRule/array',
      language,
      id,
     ),
    ],
   },
  ],
 });
};