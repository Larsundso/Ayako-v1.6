import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as DBT from '../../../../Typings/DataBaseTypings.js';
import type * as CT from '../../../../Typings/CustomTypings.js';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
 const settings = (
  await ch
   .query(
    `SELECT * FROM ${ch.constants.commands.settings.tableNames['self-roles']} WHERE guildid = $1;`,
    [cmd.guildId],
   )
   .then((r: DBT.selfroles[] | null) => r)
 )?.filter((s) => {
  const id = cmd.isAutocomplete() ? String(cmd.options.get('id', false)?.value) : '';

  return id ? Number(s.uniquetimestamp).toString(36).includes(id) : true;
 });

 const language = await ch.languageSelector(cmd.guildId);
 const lan = language.slashCommands.settings.categories['self-roles'];

 if (!settings) return [];

 return settings?.map((s) => ({
  name: `${lan.fields.name.name}: \`${s.name ?? language.None}\``,
  value: Number(s.uniquetimestamp).toString(36),
 }));
};

export default f;