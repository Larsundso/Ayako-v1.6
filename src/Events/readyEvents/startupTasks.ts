import Jobs from 'node-schedule';
import client from '../../BaseClient/Client.js';

export default async () => {
  (await import('./antivirusBlocklistCacher')).default();
  Jobs.scheduleJob('*/30 * * * *', async () => {
    (await import('./antivirusBlocklistCacher')).default();
  });

  Jobs.scheduleJob('*/1 */1 */1 * *', async () => {
    (await import('./startupTasks/nitroCycle.js')).default();

    if (client.user?.id === client.mainID) (await import('./websiteFetcher.js')).default();
    if (new Date().getHours() === 0) {
      (await import('../messageEvents/messageCreate/antispam.js')).resetData();
      (await import('../messageEvents/messageCreate/blacklist.js')).resetData();
      //      (await import('../antivirusEvents/antivirusHandler.js')).resetData();
    }
  });

  Jobs.scheduleJob('*/1 * * * *', async () => {
    (await import('./presence.js')).default();
    (await import('./verification.js')).default();
  });

  //  Jobs.scheduleJob('*/2 * * * * *', async () => {
  //    (await import('./timedFiles/timedManager.js')).default();
  //  });

  (await import('./startupTasks/cache.js')).default();
  (await import('./startupTasks/voteHandle.js')).default();
  // (await import('./startupTasks/separators.js')).default();
};