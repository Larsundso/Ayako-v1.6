import * as CT from '../../Typings/CustomTypings.js';
import * as ch from '../../BaseClient/ClientHelper.js';

export const takesFirstArg = true;
export const thisGuildOnly = [];
export const dmOnly = false;
export const dmAllowed = false;
export const type: CT.Command<typeof dmAllowed>['type'] = 'mod';
export const requiresSlashCommand = true;

const cmd: CT.Command<typeof dmAllowed>['default'] = async (msg, args) => {
 const user = await ch.getTarget(msg, args);
 if (!user) return;

 const reason = args?.slice(1).join(' ');

 const modOptions: CT.ModOptions<'softBanAdd'> = {
  reason: reason ?? '',
  guild: msg.guild,
  target: user,
  executor: msg.author,
  dbOnly: false,
  skipChecks: false,
  deleteMessageSeconds: 604800,
 };

 ch.mod(msg, 'softBanAdd', modOptions);
};

export default cmd;
