import * as Discord from 'discord.js';
import * as ch from '../../../BaseClient/ClientHelper.js';
import type CT from '../../../Typings/CustomTypings';

export default async (guild: Discord.Guild, oldGuild: Discord.Guild) => {
  const channels = await ch.getLogChannels('guildevents', guild);
  if (!channels) return;

  const language = await ch.languageSelector(guild.id);
  const lan = language.events.logs.guild;
  const con = ch.constants.events.logs.guild;
  const audit = await ch.getAudit(guild, 1);
  const auditUser = audit?.executor ?? undefined;

  const embed: Discord.APIEmbed = {
    author: {
      icon_url: con.GuildUpdate,
      name: lan.guildUpdate,
    },
    description: auditUser ? lan.descGuildUpdateAudit(auditUser) : lan.descGuildUpdate(),
    fields: [],
    color: ch.constants.colors.loading,
  };

  const oldWelcomeScreen = await ch.cache.welcomeScreens.get(guild.id);
  const newWelcomeScreen = await guild.fetchWelcomeScreen();
  if (newWelcomeScreen) ch.cache.welcomeScreens.set(newWelcomeScreen);

  const files: Discord.AttachmentPayload[] = [];
  const merge = (before: unknown, after: unknown, type: CT.AcceptedMergingTypes, name: string) =>
    ch.mergeLogging(before, after, type, embed, language, name);

  if (guild.description !== oldGuild.description) {
    merge(oldGuild.description, guild.description, 'string', language.Description);
  }
  if (guild.banner !== oldGuild.banner) {
    const getImage = async () => {
      const url = guild.bannerURL({ size: 4096 });

      if (!url) {
        embed.fields?.push({ name: lan.banner, value: lan.bannerRemoved });
        return;
      }

      const attachment = (await ch.fileURL2Buffer([url]))?.[0];

      merge(url, ch.getNameAndFileType(url), 'icon', lan.banner);

      if (attachment) files.push(attachment);
    };

    await getImage();
  }
  if (guild.icon !== oldGuild.icon) {
    const getImage = async () => {
      const url = guild.iconURL({ size: 4096 });

      if (!url) {
        embed.fields?.push({ name: lan.icon, value: lan.iconRemoved });
        return;
      }

      const attachment = (await ch.fileURL2Buffer([url]))?.[0];

      merge(url, ch.getNameAndFileType(url), 'icon', lan.icon);

      if (attachment) files.push(attachment);
    };

    await getImage();
  }
  if (guild.splash !== oldGuild.splash) {
    const getImage = async () => {
      const url = guild.splashURL({ size: 4096 });

      if (!url) {
        embed.fields?.push({ name: lan.splash, value: lan.splashRemoved });
        return;
      }

      const attachment = (await ch.fileURL2Buffer([url]))?.[0];

      merge(url, ch.getNameAndFileType(url), 'icon', lan.splash);

      if (attachment) files.push(attachment);
    };

    await getImage();
  }
  if (guild.maximumMembers !== oldGuild.maximumMembers) {
    merge(oldGuild.maximumMembers, guild.maximumMembers, 'string', lan.maxMembers);
  }
  if (guild.vanityURLCode !== oldGuild.vanityURLCode) {
    merge(oldGuild.vanityURLCode, guild.vanityURLCode, 'string', lan.vanityUrlCode);
  }
  if (guild.discoverySplash !== oldGuild.discoverySplash) {
    const getImage = async () => {
      const url = guild.discoverySplashURL({ size: 4096 });

      if (!url) {
        embed.fields?.push({ name: lan.discoverySplash, value: lan.discoverySplashRemoved });
        return;
      }

      const attachment = (await ch.fileURL2Buffer([url]))?.[0];

      merge(url, ch.getNameAndFileType(url), 'icon', lan.discoverySplash);

      if (attachment) files.push(attachment);
    };

    await getImage();
  }
  if (guild.afkChannelId !== oldGuild.afkChannelId) {
    merge(`<#${oldGuild.afkChannelId}>`, `<#${guild.afkChannelId}>`, 'string', lan.afkChannelId);
  }
  if (guild.systemChannelId !== oldGuild.systemChannelId) {
    merge(
      oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : language.none,
      guild.systemChannelId ? `<#${guild.systemChannelId}>` : language.none,
      'string',
      lan.systemChannelId,
    );
  }
  if (guild.rulesChannelId !== oldGuild.rulesChannelId) {
    merge(
      oldGuild.rulesChannelId ? `<#${oldGuild.rulesChannelId}>` : language.none,
      guild.rulesChannelId ? `<#${guild.rulesChannelId}>` : language.none,
      'string',
      lan.rulesChannelId,
    );
  }
  if (guild.publicUpdatesChannelId !== oldGuild.publicUpdatesChannelId) {
    merge(
      oldGuild.publicUpdatesChannelId ? `<#${oldGuild.publicUpdatesChannelId}>` : language.none,
      guild.publicUpdatesChannelId ? `<#${guild.publicUpdatesChannelId}>` : language.none,
      'string',
      lan.publicUpdatesChannelId,
    );
  }
  if (guild.name !== oldGuild.name) {
    merge(oldGuild.name, guild.name, 'string', lan.publicUpdatesChannelId);
  }
  if (guild.ownerId !== oldGuild.ownerId) {
    merge(`<@${oldGuild.ownerId}>`, `<@${guild.ownerId}>`, 'string', lan.ownerId);
  }
  if (guild.premiumProgressBarEnabled !== oldGuild.premiumProgressBarEnabled) {
    merge(
      oldGuild.premiumProgressBarEnabled,
      guild.premiumProgressBarEnabled,
      'boolean',
      lan.premiumProgressBarEnabled,
    );
  }
  if (guild.afkTimeout !== oldGuild.afkTimeout) {
    merge(
      ch.moment(oldGuild.afkTimeout, language),
      ch.moment(guild.afkTimeout, language),
      'string',
      lan.afkTimeout,
    );
  }
  if (guild.defaultMessageNotifications !== oldGuild.defaultMessageNotifications) {
    merge(
      lan.defaultMessageNotifications[oldGuild.defaultMessageNotifications],
      lan.defaultMessageNotifications[guild.defaultMessageNotifications],
      'string',
      lan.defaultMessageNotificationsName,
    );
  }
  if (guild.explicitContentFilter !== oldGuild.explicitContentFilter) {
    merge(
      lan.explicitContentFilter[oldGuild.explicitContentFilter],
      lan.explicitContentFilter[guild.explicitContentFilter],
      'string',
      lan.explicitContentFilterName,
    );
  }
  if (guild.mfaLevel !== oldGuild.mfaLevel) {
    merge(
      lan.mfaLevel[oldGuild.mfaLevel],
      lan.mfaLevel[guild.mfaLevel],
      'string',
      lan.mfaLevelName,
    );
  }
  if (guild.nsfwLevel !== oldGuild.nsfwLevel) {
    merge(
      lan.nsfwLevel[oldGuild.nsfwLevel],
      lan.nsfwLevel[guild.nsfwLevel],
      'string',
      lan.nsfwLevelName,
    );
  }
  if (guild.preferredLocale !== oldGuild.preferredLocale) {
    merge(
      language.regions[oldGuild.preferredLocale as keyof typeof language.regions],
      language.regions[guild.preferredLocale as keyof typeof language.regions],
      'string',
      lan.preferredLocale,
    );
  }
  if (guild.premiumTier !== oldGuild.premiumTier) {
    merge(
      `${language.Tier} ${oldGuild.premiumTier}`,
      `${language.Tier} ${guild.premiumTier}`,
      'string',
      lan.premiumTier,
    );
  }
  if (guild.verificationLevel !== oldGuild.verificationLevel) {
    merge(
      language.regions[oldGuild.preferredLocale as keyof typeof language.regions],
      language.regions[guild.preferredLocale as keyof typeof language.regions],
      'string',
      lan.preferredLocale,
    );
  }
  if (newWelcomeScreen?.description !== oldWelcomeScreen?.description) {
    merge(
      oldWelcomeScreen?.description ?? language.none,
      newWelcomeScreen?.description ?? language.none,
      'string',
      lan.welcomeScreenDescription,
    );
  }
  if (
    JSON.stringify(newWelcomeScreen?.welcomeChannels) !==
    JSON.stringify(oldWelcomeScreen?.welcomeChannels)
  ) {
    const addedChannel = ch.getDifference(
      newWelcomeScreen?.welcomeChannels.map((c) => c.channelId) ?? [],
      oldWelcomeScreen?.welcomeChannels.map((c) => c.channelId) ?? [],
    ) as {
      channelId: bigint;
      description: string;
      emojiId: bigint | undefined;
      emojiName: string | undefined;
    }[];

    const removedChannel = ch.getDifference(
      oldWelcomeScreen?.welcomeChannels.map((c) => c.channelId) ?? [],
      newWelcomeScreen?.welcomeChannels.map((c) => c.channelId) ?? [],
    ) as {
      channelId: bigint;
      description: string;
      emojiId: bigint | undefined;
      emojiName: string | undefined;
    }[];

    const changedChannel = ch.getChanged(
      (oldWelcomeScreen?.welcomeChannels.map((c) => c) ?? []) as unknown as {
        [key: string]: unknown;
      }[],
      (newWelcomeScreen?.welcomeChannels.map((c) => c) ?? []) as unknown as {
        [key: string]: unknown;
      }[],
      'channelId',
    ) as
      | {
          channelId: bigint;
          description: string;
          emojiId: bigint | undefined;
          emojiName: string | undefined;
        }[]
      | [];

    if (addedChannel.length) {
      addedChannel.forEach((c) => {
        const channel = guild.channels.cache.get(String(c.channelId));
        if (!channel) return;

        const emoji = c.emojiId ? guild.emojis.cache.get(String(c.emojiId)) : c.emojiName;

        embed.fields?.push({
          name: lan.welcomeChannelAdded,
          value: `${language.Channel}: ${language.languageFunction.getChannel(
            channel,
            language.channelTypes[channel.type],
          )}\n${language.Description}: \`${c.description}\`\n${language.Emoji}: ${
            (emoji && typeof emoji === 'object'
              ? language.languageFunction.getEmote(emoji)
              : emoji) ?? language.none
          }`,
        });
      });
    }

    if (removedChannel.length) {
      removedChannel.forEach((c) => {
        const channel = guild.channels.cache.get(String(c.channelId));
        if (!channel) return;

        const emoji = c.emojiId ? guild.emojis.cache.get(String(c.emojiId)) : c.emojiName;

        embed.fields?.push({
          name: lan.welcomeChannelRemoved,
          value: `${language.Channel}: ${language.languageFunction.getChannel(
            channel,
            language.channelTypes[channel.type],
          )}\n${language.Description}: \`${c.description}\`\n${language.Emoji}: ${
            (emoji && typeof emoji === 'object'
              ? language.languageFunction.getEmote(emoji)
              : emoji) ?? language.none
          }`,
        });
      });
    }

    if (changedChannel.length) {
      changedChannel.forEach((c) => {
        const channel = guild.channels.cache.get(String(c.channelId));
        if (!channel) return;

        const oldChannel = oldWelcomeScreen?.welcomeChannels.find(
          (o) => o.channelId === channel.id,
        );
        const newChannel = newWelcomeScreen?.welcomeChannels.find(
          (o) => o.channelId === channel.id,
        );

        if (oldChannel?.description !== newChannel?.description) {
          merge(oldChannel?.description, newChannel?.description, 'string', language.Description);
        }
        if (
          `${oldChannel?.emoji.id}-${oldChannel?.emoji.name}` !==
          `${newChannel?.emoji.id}-${newChannel?.emoji.name}`
        ) {
          const oldEmoji = oldChannel?.emoji.id
            ? guild.emojis.cache.get(oldChannel.emoji.id)
            : oldChannel?.emoji.name;
          const newEmoji = newChannel?.emoji.id
            ? guild.emojis.cache.get(newChannel.emoji.id)
            : newChannel?.emoji.name;

          merge(
            (oldEmoji && typeof oldEmoji === 'object'
              ? language.languageFunction.getEmote(oldEmoji)
              : oldEmoji) ?? language.none,
            (newEmoji && typeof newEmoji === 'object'
              ? language.languageFunction.getEmote(newEmoji)
              : newEmoji) ?? language.none,
            'string',
            lan.welcomeChannelEmoji(channel as Discord.GuildChannel),
          );
        }
      });
    }
  }

  if (guild.features !== oldGuild.features) {
    const removedToggles = ch.getDifference(
      guild.features,
      oldGuild.features,
    ) as Discord.GuildFeature[];
    const addedToggles = ch.getDifference(
      oldGuild.features,
      guild.features,
    ) as Discord.GuildFeature[];

    if (removedToggles.length) {
      embed.fields?.push({
        name: lan.togglesNameRemoved,
        value: removedToggles.map((t) => lan.toggles[t]).join(', '),
      });
    }

    if (addedToggles.length) {
      embed.fields?.push({
        name: lan.togglesNameAdded,
        value: addedToggles.map((t) => lan.toggles[t]).join(', '),
      });
    }
  }
  if (guild.systemChannelFlags !== oldGuild.systemChannelFlags) {
    const oldFlags = new Discord.SystemChannelFlagsBitField(oldGuild.systemChannelFlags).toArray();
    const newFlags = new Discord.SystemChannelFlagsBitField(guild.systemChannelFlags).toArray();

    const addedFlags = ch.getDifference(newFlags, oldFlags) as Discord.SystemChannelFlagsString[];
    const removedFlags = ch.getDifference(oldFlags, newFlags) as Discord.SystemChannelFlagsString[];

    if (addedFlags.length) {
      embed.fields?.push({
        name: lan.systemChannelFlagsNameRemoved,
        value: addedFlags
          .map((t) => lan.systemChannelFlags[t as keyof typeof lan.systemChannelFlags])
          .join(', '),
      });
    }

    if (removedFlags.length) {
      embed.fields?.push({
        name: lan.systemChannelFlagsNameAdded,
        value: removedFlags
          .map((t) => lan.systemChannelFlags[t as keyof typeof lan.systemChannelFlags])
          .join(', '),
      });
    }
  }

  if (!embed.fields?.length) return;

  ch.send({ id: channels, guildId: guild.id }, { embeds: [embed], files }, undefined, 10000);
};
