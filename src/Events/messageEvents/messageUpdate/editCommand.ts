import type * as Discord from 'discord.js';
import type CT from '../../../Typings/CustomTypings';
import type DBT from '../../../Typings/DataBaseTypings';
import client from '../../../BaseClient/Client.js';
import { getCommand } from '../messageCreate/commandHandler';

export default async (oldMsg: Discord.Message, message: Discord.Message) => {
  const msg = (await (
    await import('../messageCreate/messageCreate')
  ).convertMsg(message)) as CT.GuildMessage;

  if (!oldMsg || !msg || !oldMsg.content || !msg.content) return;
  if (oldMsg.content === msg.content) return;
  if (oldMsg.crosspostable !== msg.crosspostable) return;

  let prefix;
  const prefixStandard = client.customConstants.standard.prefix;
  let prefixCustom;

  if (msg.channel.type !== 1) {
    prefixCustom = await client.ch
      .query('SELECT * FROM guildsettings WHERE guildid = $1;', [String(msg.guild.id)])
      .then((r: DBT.guildsettings[] | null) => (r ? r[0].prefix : null));
  }

  if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
  else if (prefixCustom && msg.content.toLowerCase().startsWith(prefixCustom)) {
    prefix = prefixCustom;
  } else return;
  if (!prefix) return;

  const args = msg.content.slice(prefix.length).split(/ +/);
  const { file: command } = await getCommand(args);
  if (!command) return;

  client.emit('messageCreate', msg);
};
