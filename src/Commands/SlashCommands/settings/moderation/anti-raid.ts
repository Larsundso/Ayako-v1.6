import * as Discord from 'discord.js';
import client from '../../../../BaseClient/Client.js';
import type * as DBT from '../../../../Typings/DataBaseTypings';

export default async (cmd: Discord.CommandInteraction | Discord.ChatInputCommandInteraction) => {
  if (!cmd.inGuild()) return;

  const language = await client.ch.languageSelector(cmd.guild?.id);
  const subcommandName = cmd.options.data
    .find((c) => c.type === Discord.ApplicationCommandOptionType.SubcommandGroup)
    ?.options?.find((c) => c.type === Discord.ApplicationCommandOptionType.Subcommand)?.name;
  if (!subcommandName) throw new Error('No Sub-Command Name found');
  const { embedParsers, buttonParsers } = client.ch.settingsHelpers;

  const settings = await client.ch
    .query(
      `SELECT * FROM ${client.customConstants.commands.settings.tableNames['anti-raid']} WHERE guildid = $1;`,
      [cmd.guild?.id],
    )
    .then((r: DBT.antiraid[] | null) => (r ? r[0] : null));
  const lan = language.slashCommands.settings.categories['anti-raid'];
  const name = 'anti-raid';

  const embeds: Discord.APIEmbed[] = [
    {
      author: {
        icon_url: client.objectEmotes.settings.link,
        name: language.slashCommands.settings.authorType(lan.name),
        url: client.customConstants.standard.invite,
      },
      fields: [
        {
          name: language.slashCommands.settings.active,
          value: embedParsers.boolean(settings?.active, language),
          inline: false,
        },

        {
          name: lan.fields.punishmenttof.name,
          value: embedParsers.boolean(settings?.punishmenttof, language),
          inline: true,
        },
        {
          name: lan.fields.punishment.name,
          value: settings?.punishment
            ? language.punishments[settings?.punishment as keyof typeof language.punishments]
            : language.none,
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: lan.fields.posttof.name,
          value: embedParsers.boolean(settings?.posttof, language),
          inline: true,
        },
        {
          name: lan.fields.postchannel.name,
          value: embedParsers.channel(settings?.postchannel, language),
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: lan.fields.time.name,
          value: embedParsers.number(settings?.time, language),
          inline: true,
        },
        {
          name: lan.fields.jointhreshold.name,
          value: embedParsers.number(settings?.jointhreshold, language),
          inline: true,
        },

        {
          name: lan.fields.pingroles.name,
          value: embedParsers.roles(settings?.pingroles, language),
          inline: false,
        },
        {
          name: lan.fields.pingusers.name,
          value: embedParsers.users(settings?.pingusers, language),
          inline: false,
        },
      ],
    },
  ];

  const components: Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent>[] = [
    {
      type: Discord.ComponentType.ActionRow,
      components: [buttonParsers.global(language, !!settings?.active, name)],
    },
    {
      type: Discord.ComponentType.ActionRow,
      components: [
        buttonParsers.specific(language, settings?.punishmenttof, 'punishmenttof', name),
        buttonParsers.specific(language, settings?.punishment, 'punishment', name),
        buttonParsers.specific(language, settings?.posttof, 'posttof', name),
        buttonParsers.specific(language, settings?.postchannel, 'postchannel', name, 'channel'),
      ],
    },
    {
      type: Discord.ComponentType.ActionRow,
      components: [
        buttonParsers.specific(language, settings?.time, 'time', name),
        buttonParsers.specific(language, settings?.jointhreshold, 'jointhreshold', name),
        buttonParsers.specific(language, settings?.pingroles, 'pingroles', name, 'role'),
        buttonParsers.specific(language, settings?.pingusers, 'pingusers', name, 'user'),
      ],
    },
  ];

  cmd.reply({
    embeds,
    components,
    ephemeral: true,
  });
};