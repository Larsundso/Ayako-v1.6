import * as ch from '../../../../BaseClient/ClientHelper.js';
import type * as DBT from '../../../../Typings/DataBaseTypings';
import type * as CT from '../../../../Typings/CustomTypings';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
  const settings = (
    await ch
      .query(
        `SELECT * FROM ${ch.constants.commands.settings.tableNames['vote-rewards']} WHERE guildid = $1;`,
        [cmd.guildId],
      )
      .then((r: DBT.voterewards[] | null) => r)
  )?.filter((s) => {
    const id = cmd.isAutocomplete() ? String(cmd.options.get('id', false)?.value) : '';

    return id ? Number(s.uniquetimestamp).toString(36).includes(id) : true;
  });

  const language = await ch.languageSelector(cmd.guildId);
  const lan = language.slashCommands.settings.categories['vote-rewards'];

  if (!settings) return [];

  return settings?.map((s) => ({
    name: `${lan.fields.tier.name}: ${s.tier ?? language.None} - ${lan.fields.linkedid.name}: ${
      s?.linkedid ? Number(s.linkedid).toString(36) : language.None
    }`,
    value: Number(s.uniquetimestamp).toString(36),
  }));
};

export default f;