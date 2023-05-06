import type * as Discord from 'discord.js';
import glob from 'glob';

export default async (cmd: Discord.Interaction) => {
 if (!cmd.isAnySelectMenu()) return;

 const getType = () => {
  switch (true) {
   case cmd.isChannelSelectMenu(): {
    return 'Channel';
   }
   case cmd.isRoleSelectMenu(): {
    return 'Role';
   }
   case cmd.isUserSelectMenu(): {
    return 'User';
   }
   case cmd.isStringSelectMenu(): {
    return 'String';
   }
   case cmd.isMentionableSelectMenu(): {
    return 'Mention';
   }
   default: {
    throw new Error(`Unknown Select Menu\n${JSON.stringify(cmd, null, 2)}`);
   }
  }
 };

 const files: string[] = await new Promise((resolve) => {
  glob(`${process.cwd()}/Commands/SelectCommands/${getType()}Select/**/*`, (err, res) => {
   if (err) throw err;
   resolve(res);
  });
 });

 const args = cmd.customId.split(/_+/g);
 const path = args.shift();
 const command = files.find((f) => f.endsWith(`/${path}.js`));
 // eslint-disable-next-line no-console
 console.log(path);
 if (!command) return;

 (await import(command)).default(cmd, args);
};
