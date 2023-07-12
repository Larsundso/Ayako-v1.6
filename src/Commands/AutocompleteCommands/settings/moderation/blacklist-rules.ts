import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as CT from '../../../../Typings/CustomTypings';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
 const automodRules = cmd.guild?.autoModerationRules.cache
  .map((o) => o)
  ?.filter((r) => {
   const id = cmd.isAutocomplete() ? String(cmd.options.get('id', false)?.value) : '';

   return id ? r.id.includes(id) : true;
  });

 if (!automodRules) return [];

 const language = await ch.languageSelector(cmd.guildId);

 return automodRules?.map((r) => ({
  name: `${r.name.slice(0, 100) ?? language.None}`,
  value: r.id,
 }));
};

export default f;