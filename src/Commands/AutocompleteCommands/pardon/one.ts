import * as ch from '../../../BaseClient/ClientHelper.js';
import * as CT from '../../../Typings/CustomTypings.js';

const f: CT.AutoCompleteFile['default'] = async (cmd) => {
 const user = cmd.options.get('target', false)?.value as string;
 if (!user) return [];

 const type = cmd.options.getString('type', false) as
  | 'warn'
  | 'mute'
  | 'kick'
  | 'ban'
  | 'channelban';
 if (!type) return [];

 const punishments = await ch.getPunishment(user, 'with-type', type);

 return punishments?.splice(0, 25).map((c) => ({
  name: Number(c.uniquetimestamp).toString(36),
  value: c.uniquetimestamp,
 }));
};

export default f;