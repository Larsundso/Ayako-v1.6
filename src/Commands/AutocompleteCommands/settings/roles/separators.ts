import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as DBT from '../../../../Typings/DataBaseTypings.js';
import type * as CT from '../../../../Typings/CustomTypings.js';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
 const settings = (
  await ch
   .query(
    `SELECT * FROM ${ch.constants.commands.settings.tableNames.separators} WHERE guildid = $1;`,
    [cmd.guildId],
   )
   .then((r: DBT.roleseparator[] | null) => r)
 )?.filter((s) => {
  const id = cmd.isAutocomplete() ? String(cmd.options.get('id', false)?.value) : '';

  return id ? Number(s.uniquetimestamp).toString(36).includes(id) : true;
 });

 if (!settings) return [];

 return settings?.map((s) => ({
  name: `ID: ${Number(s.uniquetimestamp).toString(36)}`,
  value: Number(s.uniquetimestamp).toString(36),
 }));
};

export default f;