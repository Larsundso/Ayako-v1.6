import client from '../../../../BaseClient/Bot/Client.js';

export default async () => {
 const [userSize, guildSize, memberSize, roleSize, channelSize] = await Promise.all([
  client.cluster?.fetchClientValues('users.cache.size'),
  client.cluster?.fetchClientValues('guilds.cache.size'),
  client.cluster?.broadcastEval((c) =>
   c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
  ),
  client.cluster?.broadcastEval((c) =>
   c.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0),
  ),
  client.cluster?.broadcastEval((c) =>
   c.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0),
  ),
 ]);

 const totalusers = (userSize as number[] | undefined)?.reduce((acc, count) => acc + count, 0) ?? 0;
 const totalmembers =
  (memberSize as number[] | undefined)?.reduce((acc, count) => acc + count, 0) ?? 0;
 const totalrolecount =
  (roleSize as number[] | undefined)?.reduce((acc, count) => acc + count, 0) ?? 0;
 const totalchannelcount =
  (channelSize as number[] | undefined)?.reduce((acc, count) => acc + count, 0) ?? 0;
 const totalguildcount =
  (guildSize as number[] | undefined)?.reduce((acc, count) => acc + count, 0) ?? 0;

 client.util.DataBase.stats
  .updateMany({
   data: {
    usercount: totalusers,
    guildcount: totalguildcount,
    channelcount: totalchannelcount,
    rolecount: totalrolecount,
    allusers: totalmembers,
   },
  })
  .then();
};