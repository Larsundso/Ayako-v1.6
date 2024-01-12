import * as Sharding from 'discord-hybrid-sharding';
import * as Discord from 'discord.js';
import 'dotenv/config';
import readline from 'readline';
import * as AutoPoster from 'topgg-autoposter';
import log from '../UtilModules/logError.js';

const manager = new Sharding.ClusterManager(`./dist/bot.js`, {
 totalShards: 'auto',
 totalClusters: 'auto',
 token: process.env.Token,
 shardArgs: process.argv,
 execArgv: ['--experimental-wasm-modules'],
 respawn: true,
 mode: 'process',
});

manager.extend(new Sharding.ReClusterManager({ restartMode: 'rolling' }));

await manager.spawn().catch((e) => {
 log(e, true);

 log(
  `[Cluster Manager] Startup Failed. Retry after: ${
   Number(e.headers?.get('retry-after') ?? 0) / 60
  } Minutes`,
  true,
 );
 process.exit(1);
});

export default manager;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', async (msg: string) => {
 const parts = msg.trim().split(/\s+/);
 const code = parts.join(' ');

 if (!code.startsWith('restart')) return;

 log('[Cluster Manager] Restarting all Clusters...');
 manager.recluster?.start({ restartMode: 'rolling' });
});

if (
 Buffer.from(process.env.Token?.replace('Bot ', '').split('.')[0] ?? '0', 'base64').toString() ===
 process.env.mainID
) {
 new AutoPoster.DJSSharderPoster(
  process.env.topGGToken ?? '',
  new Discord.ShardingManager(`./dist/bot.js`, {
   totalShards: manager.totalShards,
   shardList: manager.shardList,
   mode: manager.mode,
   respawn: manager.respawn,
   shardArgs: manager.shardArgs,
   execArgv: manager.execArgv,
  }),
  { startPosting: true },
 );
}
