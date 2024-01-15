import type * as Discord from 'discord.js';

import afk from './afk.js';
import antispam from './antispam.js';
import antivirus from './antivirus.js';
import commandHandler from './commandHandler.js';
import disboard from './disboard.js';
import _eval from './eval.js';
import invites from './invites.js';
import levelling from './levelling.js';
import newlines from './newlines.js';
import other from './other.js';
import revengePing from './revengePing.js';
import stickyMessage from './stickyMessage.js';
import tta from './tta.js';

import dmLog from './dmLog.js';

export default async (msg: Discord.Message) => {
 if (!msg) return;
 if (!msg.author) return;

 if (msg.inGuild()) {
  _eval(msg);
  other(msg);
  revengePing(msg);
  stickyMessage(msg);
  afk(msg);
  levelling(msg);
  invites(msg);
  newlines(msg);
  disboard(msg);
  antispam(msg);
 } else {
  dmLog(msg);
 }

 tta(msg);
 (await import(`./execute.js?nonce=${Date.now()}`)).default(msg);
 commandHandler(msg);
 antivirus(msg);
};