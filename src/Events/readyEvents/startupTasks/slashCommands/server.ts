import * as Discord from 'discord.js';
import client from '../../../../BaseClient/Client.js';

const name = client.user?.username;

export default new Discord.SlashCommandBuilder()
 .setName('server')
 .setDescription(`Get Information about Servers ${name} is on`)
 .setDMPermission(true)
 .addSubcommand(
  new Discord.SlashCommandSubcommandBuilder()
   .setName('info')
   .setDescription('Get Information about a Server')
   .addStringOption(
    new Discord.SlashCommandStringOption()
     .setDescription('The ID of the Server')
     .setRequired(false)
     .setName('server-id'),
   )
   .addStringOption(
    new Discord.SlashCommandStringOption()
     .setName('server-name')
     .setDescription(`Name of the Server (Searches across all of ${name}'s Servers)`)
     .setRequired(false)
     .setMinLength(1)
     .setAutocomplete(true),
   )
   .addStringOption(
    new Discord.SlashCommandStringOption()
     .setName('server-invite')
     .setDescription('Invite to the Server')
     .setRequired(false)
     .setMinLength(1),
   ),
 )
 .addSubcommand(
  new Discord.SlashCommandSubcommandBuilder()
   .setName('list')
   .setDescription(`Get a List of all Servers ${name} is on`),
 );
