import Jobs from 'node-schedule';
import * as ch from '../../BaseClient/ClientHelper.js';
import client from '../../BaseClient/Client.js';

import cache from './startupTasks/cache.js';
import slashCommandInitializer from './startupTasks/slashCommandInitializer.js';
import voteHandler from './startupTasks/voteHandler.js';
import appealHandler from './startupTasks/appealHandler.js';
import interactionHandler from '../interaction.js';
import customAPIsHandler from './startupTasks/customAPIsHandler.js';
import customBotCommands from './startupTasks/customBotCommands.js';

import antivirusBlocklistCacher from './timedFiles/antivirusBlocklistCacher.js';
import websiteFetcher from './timedFiles/websiteFetcher.js';
import verification from './timedFiles/verification.js';
import presence from './timedFiles/presence.js';
import timedManager from './timedFiles/timedManager.js';

export default async () => {
 customAPIsHandler();
 customBotCommands();

 voteHandler();
 appealHandler();
 interactionHandler();
 slashCommandInitializer();
 antivirusBlocklistCacher();

 Jobs.scheduleJob(new Date(Date.now() + 5000), () => {
  cache();
 });

 if (client.user?.id === ch.mainID) {
  ch.cache.fishFish.start();
  ch.cache.sinkingYachts.start();
  ch.cache.urlTLDs.start();
 }

 Jobs.scheduleJob('0 0 0 * * *', async () => {
  animekosInviteStats();
  rpToggleUses();
  ch.cache.sinkingYachts.start();
  ch.cache.urlTLDs.start();
 });

 Jobs.scheduleJob('0 * * * * *', async () => {
  presence();
  verification();
 });

 Jobs.scheduleJob('0 */30 * * *', async () => antivirusBlocklistCacher());
 Jobs.scheduleJob('*/2 * * * * *', async () => timedManager());

 if (client.user?.id !== ch.mainID) return;
 Jobs.scheduleJob('*/1 */1 */1 * *', async () => websiteFetcher());
};

const rpToggleUses = () =>
 ch.DataBase.guildsettings
  .updateMany({
   where: { rpenableruns: { not: 0 } },
   data: { rpenableruns: 0 },
  })
  .then();

const animekosInviteStats = async () => {
 const guild = client.guilds.cache.get('298954459172700181');
 if (!guild) return;

 const invites = await ch.getAllInvites(guild);
 if (!invites) return;

 const inviteTxt = ch.txtFileWriter(
  `${invites
   .map((i) => (Number(i.uses) > 9 ? `${i.code} ${i.uses}` : null))
   .filter((i): i is string => !!i)
   .join('\n')}\n${guild.memberCount}`,
 );
 if (!inviteTxt) return;

 ch.send({ id: '958483683856228382', guildId: guild.id }, { files: [inviteTxt] });
};
