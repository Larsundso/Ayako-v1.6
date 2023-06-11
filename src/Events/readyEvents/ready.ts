import * as Jobs from 'node-schedule';
import * as ch from '../../BaseClient/ClientHelper.js';
import client from '../../BaseClient/Client.js';

import willisDiabloCounter from './startupTasks/willisDiabloCounter.js';

// eslint-disable-next-line no-console
const { log } = console;

export default async () => {
 log(
  `| Logged in\n| => Bot: ${client.user?.username}#${client.user?.discriminator} / ${
   client.user?.id
  }\n| Login at ${new Date(Date.now()).toLocaleString()}`,
 );

 Jobs.scheduleJob('*/10 * * * *', async () => {
  log(`=> Current Date: ${new Date().toLocaleString()}`);
 });

 willisDiabloCounter();
 (await import('./startupTasks/cache.js')).default();
 (await import('./startupTasks/slashCommandInitializer.js')).default();
 (await import('./startupTasks.js')).default();

 if (ch.mainID !== client.user?.id) return;

 Jobs.scheduleJob('0 0 0 */1 * *', async () => {
  animekosInviteStats();
  rpToggleUses();
 });
};

const rpToggleUses = async () => {
 ch.query(`UPDATE guildsettings SET rpenableruns = 0 WHERE rpenableruns != 0;`);
};

const animekosInviteStats = async () => {
 const guild = client.guilds.cache.get('298954459172700181');
 if (!guild) return;

 const invites = await guild.invites.fetch();
 if (!invites) return;

 const inviteTxt = ch.txtFileWriter(
  invites
   .map((i) => (Number(i.uses) > 9 ? `${i.code} ${i.uses}` : null))
   .filter((i): i is string => !!i),
 );
 if (!inviteTxt) return;

 ch.send({ id: '958483683856228382', guildId: guild.id }, { files: [inviteTxt] });
};
