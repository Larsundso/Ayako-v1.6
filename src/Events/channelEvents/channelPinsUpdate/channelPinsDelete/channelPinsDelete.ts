import type * as Discord from 'discord.js';

export default async (
  pin: Discord.Message,
  channel:
    | Discord.NewsChannel
    | Discord.TextChannel
    | Discord.PrivateThreadChannel
    | Discord.PublicThreadChannel
    | Discord.VoiceChannel,
) => {
  const files: {
    default: (
      r: Discord.Message,
      t:
        | Discord.NewsChannel
        | Discord.TextChannel
        | Discord.PrivateThreadChannel
        | Discord.PublicThreadChannel<boolean>
        | Discord.VoiceChannel,
    ) => void;
  }[] = await Promise.all(['./log.js'].map((p) => import(p)));

  files.forEach((f) => f.default(pin, channel));
};