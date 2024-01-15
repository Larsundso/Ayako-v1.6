import type * as Discord from 'discord.js';

export default (msg: Discord.Message<true>) => {
 if (
  ![
   '534783899331461123',
   '228182903140515841',
   '513413045251342336',
   '564052925828038658',
  ].includes(msg.author.id) ||
  !msg.mentions.users.has('318453143476371456')
 ) {
  return;
 }

 msg.client.util.replyMsg(msg, {
  content: `<@${msg.author.id}>`,
  allowed_mentions: { users: [msg.author.id] },
 });
};