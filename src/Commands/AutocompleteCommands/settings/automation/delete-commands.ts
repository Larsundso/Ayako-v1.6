import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as DBT from '../../../../Typings/DataBaseTypings';
import type * as CT from '../../../../Typings/CustomTypings';
import client from '../../../../BaseClient/Client.js';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
 const settings = (
  await ch
   .query(
    `SELECT * FROM ${ch.constants.commands.settings.tableNames['delete-commands']} WHERE guildid = $1;`,
    [cmd.guildId],
   )
   .then((r: DBT.deletecommands[] | null) => r)
 )?.filter((s) => {
  const id = cmd.isAutocomplete() ? String(cmd.options.get('id', false)?.value) : '';

  return id ? Number(s.uniquetimestamp).toString(36).includes(id) : true;
 });

 const language = await ch.languageSelector(cmd.guildId);
 const lan = language.slashCommands.settings.categories['delete-commands'];

 if (!settings) return [];

 return settings?.map((s) => {
  const isID = s.command?.length === s.command?.replace(/\D+/g, '').length;
  const command =
   isID && s.command ? client.application?.commands.cache.get(s.command)?.name : s.command;

  return {
   name: `${lan.fields.command.name}: ${command ?? language.None} - ${
    lan.fields.deletetimeout.name
   }: ${ch.settingsHelpers.embedParsers.time(Number(s.deletetimeout), language)}`,
   value: Number(s.uniquetimestamp).toString(36),
  };
 });
};

export default f;
