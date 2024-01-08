import * as Discord from 'discord.js';
import client from '../BaseClient/Client.js';

export default async (eventName: string, args: unknown[]) => {
 firstGuildInteraction(eventName, args);

 const event = (await client.util.getEvents()).find((e) => e.endsWith(`${eventName}.js`));
 if (!event) return;

 (await import(event)).default(...args);
};

const ignoreEvents = [
 Discord.Events.Debug,
 Discord.Events.CacheSweep,
 Discord.Events.ClientReady,
 Discord.Events.Error,
 Discord.Events.Invalidated,
 Discord.Events.Raw,
 Discord.Events.PresenceUpdate,
 Discord.Events.ShardDisconnect,
 Discord.Events.ShardError,
 Discord.Events.ShardReady,
 Discord.Events.ShardReconnecting,
 Discord.Events.ShardResume,
 Discord.Events.Warn,
];

const firstGuildInteraction = (eventName: string, args: unknown[]) => {
 if (ignoreEvents.includes(eventName)) return;

 switch (true) {
  case typeof args[0] === 'object' && args[0] && args[0] instanceof Discord.Guild: {
   client.util.firstGuildInteraction(args[0] as Discord.Guild);
   break;
  }
  case typeof args[1] === 'object' && args[1] && args[1] instanceof Discord.Guild: {
   client.util.firstGuildInteraction(args[1] as Discord.Guild);
   break;
  }
  case typeof args[0] === 'object' &&
   args[0] &&
   'guild' in (args[0] as Record<'guild', Discord.Guild>): {
   client.util.firstGuildInteraction(
    (args[0] as Record<'guild', Discord.Guild>).guild as Discord.Guild,
   );
   break;
  }
  case typeof args[1] === 'object' &&
   args[1] &&
   'guild' in (args[1] as Record<'guild', Discord.Guild>): {
   client.util.firstGuildInteraction(
    (args[1] as Record<'guild', Discord.Guild>).guild as Discord.Guild,
   );
   break;
  }
  default: {
   break;
  }
 }
};
