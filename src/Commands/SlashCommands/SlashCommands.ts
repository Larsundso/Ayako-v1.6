import * as Discord from 'discord.js';
import client from '../../BaseClient/Client.js';

// Pre-defined values

const IDSelector = new Discord.SlashCommandStringOption()
  .setAutocomplete(true)
  .setDescription('The ID of the Setting')
  .setRequired(false)
  .setMaxLength(8)
  .setMinLength(8)
  .setName('id');

// Commands

const settings = new Discord.SlashCommandBuilder()
  .setName('settings')
  .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
  .setDescription(`Manage ${client.user?.username}'s Settings`)
  .setDMPermission(false)
  .addSubcommandGroup(
    new Discord.SlashCommandSubcommandGroupBuilder()
      .setName('moderation')
      .setDescription(`Everything about ${client.user?.username}'s Moderation`)
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('anti-spam')
          .setDescription('Stop Members from spamming'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('anti-virus')
          .setDescription('Stop Members from posting harmful Links'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('anti-raid')
          .setDescription('Automatically detect Raids and punish Raiders'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('auto-punish')
          .setDescription('Help Moderators punish consistently')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('blacklist')
          .setDescription('Stop Members from using specific Words or Phrases'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('expiry')
          .setDescription('Define when logged Punishments expire'),
      ),
  )
  .addSubcommandGroup(
    new Discord.SlashCommandSubcommandGroupBuilder()
      .setName('leveling')
      .setDescription(`Everything about ${client.user?.username}'s Leveling`)
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('basic')
          .setDescription('Reward Members for their activity with Server Levels'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('multi-channels')
          .setDescription('Increase or decrease XP rewarded by Channel')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('multi-roles')
          .setDescription('Increase or decrease XP rewarded by Role')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('level-roles')
          .setDescription('Reward Activity with Level-Roles')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('rule-channels')
          .setDescription('Apply conditional XP rewarded by Action in a Channel')
          .addStringOption(IDSelector),
      ),
  )
  .addSubcommandGroup(
    new Discord.SlashCommandSubcommandGroupBuilder()
      .setName('automation')
      .setDescription(`Everything about ${client.user?.username}'s Automation`)
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('auto-roles')
          .setDescription('Assign Roles to Users and Bots when joining'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('cooldowns')
          .setDescription(`Assign custom defined Cooldowns to Commands of ${client.user?.username}`)
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('disboard')
          .setDescription('Have a Bump reminder remind your Members to bump your Server'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('logs')
          .setDescription('Log Changes to any Part of your Server'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('self-roles')
          .setDescription('Let Members pick their own Roles')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('separators')
          .setDescription('Separate Roles into Categories using Category Roles / Role Separators')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('sticky')
          .setDescription('Make Roles and Channel Permissions stick to Members across re-joins'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('suggestions')
          .setDescription('Let your Members help you decide through a suggestions Channel'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('verification')
          .setDescription('Make joining Users verify with a Captcha'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('welcome')
          .setDescription('Greet joining Users with a welcome Message'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('nitro-monitoring')
          .setDescription('Reward Boosters with Roles for consistent Boosting or other Rewards'),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('reaction-roles')
          .setDescription('Let Members pick their own Roles through Reactions')
          .addStringOption(IDSelector),
      )
      .addSubcommand(
        new Discord.SlashCommandSubcommandBuilder()
          .setName('button-roles')
          .setDescription('Let Members pick their own Roles through Buttons')
          .addStringOption(IDSelector),
      ),
  )
  .addSubcommand(
    new Discord.SlashCommandSubcommandBuilder()
      .setName('basic')
      .setDescription(`Basic Settings to modify ${client.user?.username}'s behaviour`),
  );

export default { public: { settings } };
