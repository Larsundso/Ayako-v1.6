import * as Discord from 'discord.js';
import * as ch from '../../BaseClient/ClientHelper.js';
import * as DBT from '../../Typings/DataBaseTypings';
import rp from '../SlashCommands/rp.js';

export default async (cmd: Discord.ButtonInteraction) => {
 if (!cmd.inCachedGuild()) return;

 const settings = !(await ch
  .query(`SELECT * FROM guildsettings WHERE guildid = $1;`, [cmd.guildId])
  .then((r: DBT.guildsettings[] | null) => r?.[0].enabledrp));

 ch.query(
  `INSERT INTO guildsettings (guildid, enabledrp) VALUES ($1, $2) 
   ON CONFLICT (guildid) DO UPDATE SET enabledrp = $2;`,
  [cmd.guildId, settings],
 );

 if (!settings) deleteAll(cmd);
 else create(cmd);
};

const deleteAll = async (cmd: Discord.ButtonInteraction<'cached'>) => {
 await cmd.guild.commands.set([]);
 rp(cmd, [], true);
};

const create = async (cmd: Discord.ButtonInteraction<'cached'>) => {
 const commands = await cmd.guild.commands.fetch();

 const registerCommands = ch.constants.commands.interactions
  .filter((c) => !commands.find((existing) => existing.name === c.name))
  .map((c) => {
   const command = new Discord.SlashCommandBuilder().setName(c.name).setDescription(c.desc);

   if (c.users) {
    command.addUserOption(
     new Discord.SlashCommandUserOption()
      .setDescription('The User to interact with')
      .setRequired(c.reqUser)
      .setName('user'),
    );
   }

   command.addStringOption(
    new Discord.SlashCommandStringOption()
     .setName('text')
     .setDescription('The text to Display')
     .setRequired(false),
   );

   if ('specialOptions' in c && c.specialOptions) {
    c.specialOptions.forEach((o) =>
     command.addStringOption(
      new Discord.SlashCommandStringOption()
       .setName(o.name)
       .setDescription(o.desc)
       .setRequired(false),
     ),
    );
   }

   if (c.users) {
    new Array(3).fill(null).forEach((_, i) => {
     command.addUserOption(
      new Discord.SlashCommandUserOption()
       .setDescription(`Another User to interact with`)
       .setRequired(false)
       .setName(`user-${i}`),
     );
    });
   }

   return command;
  });

 await cmd.guild.commands.set(registerCommands);

 rp(cmd, [], true);
};
