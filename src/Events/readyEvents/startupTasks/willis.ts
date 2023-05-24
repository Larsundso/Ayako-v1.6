/*
import * as Discord from 'discord.js';
import * as ch from '../../../BaseClient/ClientHelper.js';
import client from '../../../BaseClient/Client.js';
import type * as DBT from '../../../Typings/DataBaseTypings';

export default async () => {
  return;
  if (!client.guilds.cache.get('108176345204264960')) return;

  const participants = await ch
    .query(`SELECT willis FROM stats;`, undefined,
   {
    returnType: 'stats',
    asArray: false,
   }
   )
  if (!participants?.willis) return;

  const winnerID = participants.willis[ch.getRandom(0, participants.willis.length)];
  const winner = await client.users.fetch(winnerID).catch(() => undefined);
  if (!winner) return;

  ch.query(`UPDATE stats SET willis = $1;`, [[]]);

  dm(winner);
  announce(winner);
  tellWill(winner);
};

const dm = async (user: Discord.User) => {
  const c = await user.createDM();
  c.send({
    content:
      'Congratulations on winning the Monthly $50 Giftcard Giveaway\nDM Will to claim your prize',
  }).catch(() => false);
};

const announce = async (user: Discord.User) => {
  const channel = client.channels.cache.get('1085554467883188224') as Discord.TextChannel;
  const message = await channel.messages.fetch('1085607979094659102').catch(() => undefined);

  message?.edit({
    embeds: [
      {
        title: 'Wills Hangout $50 Giftcard Giveaway Winner',
        description: `Last months winner was: ${user}`,
        footer: { text: 'Remember to open your DMS so I can notify you, if you win' },
        color: 0xffffff,
      },
    ],
  });
};

const tellWill = async (user: Discord.User) => {
  const will = await client.users.fetch('108176076261314560').catch(() => undefined);
  will
    ?.send({
      content: `The new Winner of your $50 Giftcard Giveaway is ${
       user
      } / \`${user.tag}\` / \`${user.id}\``,
      components: [
        {
          type: Discord.ComponentType.ActionRow,
          components: [
            {
              type: Discord.ComponentType.Button,
              style: Discord.ButtonStyle.Link,
              label: 'Take me to the winner',
              url: `discord://-/users/${user.id}`,
            },
          ],
        },
      ],
    })
    .catch(() => false);
};
*/
