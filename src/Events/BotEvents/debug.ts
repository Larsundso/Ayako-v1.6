import log from '../../BaseClient/UtilModules/logError.js';
import DataBase from '../../BaseClient/Bot/DataBase.js';

const debugEnabled = process.argv.includes('--debug');

export default (message: string) => {
 if (message.includes('Heartbeat')) {
  DataBase.stats
   .updateMany({
    data: {
     heartbeat: message.split(' ').at(-1)?.replace(/\D/g, ''),
    },
   })
   .then();

  log(message);
  return;
 }

 if (!debugEnabled) {
  log(message);
  return;
 }

 log(message, true);
};