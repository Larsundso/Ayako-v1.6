import * as Jobs from 'node-schedule';
import type * as separator from '../../guildEvents/guildMemberUpdate/separator.js';
import * as ch from '../../../BaseClient/ClientHelper.js';
import client from '../../../BaseClient/Client.js';

export default async () => {
 const settings = await ch.DataBase.roleseparatorsettings.findMany({
  where: { startat: { lt: Date.now() - 3900000 } },
 });

 settings.forEach((s) => {
  client.shard?.broadcastEval(
   async (cl, { guildid, channelid, messageid }) => {
    const guild = cl.guilds.cache.get(guildid);
    if (!guild) return;

    const chEval: typeof ch = await import(`${process.cwd()}/BaseClient/ClientHelper.js`);
    const { separatorAssigner }: typeof separator = await import(
     `${process.cwd()}/Events/guildEvents/guildMemberUpdate/separator.js`
    );

    if (!separatorAssigner) return;
    separatorAssigner.get(guild.id)?.forEach((job) => {
     job.cancel();
    });

    separatorAssigner.delete(guild.id);

    const channel = channelid ? await chEval.getChannel.guildTextChannel(channelid) : undefined;
    const message =
     messageid && channel
      ? await chEval.request.channels
         .getMessage(channel, messageid)
         .then((m) => ('message' in m ? undefined : m))
      : undefined;

    const oTR: typeof separator = await import(
     `${process.cwd()}/Events/guildEvents/guildMemberUpdate/separator.js`
    );

    Jobs.scheduleJob(new Date(Date.now() + 300000), () => {
     oTR.oneTimeRunner(
      message ?? {
       guild,
       author: cl.user,
       channel,
       id: messageid,
      },
      {},
     );
    });
   },
   { context: s },
  );
 });
};