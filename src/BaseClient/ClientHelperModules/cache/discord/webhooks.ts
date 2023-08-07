import type * as Discord from 'discord.js';

export interface Webhooks {
 get: (
  webhookId: string,
  channelId: string,
  guildId: string,
 ) => Promise<Discord.Webhook | undefined>;
 set: (webhook: Discord.Webhook) => void;
 find: (webhookId: string) => Discord.Webhook | undefined;
 delete: (webhookId: string) => void;
 cache: Map<string, Map<string, Map<string, Discord.Webhook>>>;
}

const self: Webhooks = {
 get: async (id, channelId, guildId) => {
  const cached = self.cache.get(guildId)?.get(channelId)?.get(id);
  if (cached) return cached;

  const client = (await import('../../../Client.js')).default;
  const fetched = await client.guilds.cache.get(guildId)?.fetchWebhooks();
  fetched?.forEach((f) => self.set(f));

  return fetched?.find((f) => f.id === id);
 },
 set: (webhook) => {
  if (!self.cache.get(webhook.guildId)) {
   self.cache.set(webhook.guildId, new Map());
  }

  if (!self.cache.get(webhook.guildId)?.get(webhook.channelId)) {
   self.cache.get(webhook.guildId)?.set(webhook.channelId, new Map());
  }

  if (webhook.channelId) {
   self.cache.get(webhook.guildId)?.get(webhook.channelId)?.set(webhook.id, webhook);
  }
 },
 find: (id) =>
  Array.from(self.cache, ([, g]) => g)
   .map((c) => Array.from(c, ([, i]) => i))
   .flat()
   .find((c) => c.get(id))
   ?.get(id),
 delete: (id) => {
  const cached = self.find(id);
  if (!cached || !cached.guildId || !cached.channelId) return;

  if (self.cache.get(cached.guildId)?.size === 1) {
   if (self.cache.get(cached.guildId)?.get(cached.channelId)?.size === 1) {
    self.cache.get(cached.guildId)?.get(cached.channelId)?.clear();
   } else {
    self.cache.get(cached.guildId)?.get(cached.channelId)?.delete(id);
   }
  } else if (self.cache.get(cached.guildId)?.get(cached.channelId)?.size === 1) {
   self.cache.get(cached.guildId)?.delete(cached.channelId);
  } else {
   self.cache.get(cached.guildId)?.get(cached.channelId)?.delete(id);
  }
 },
 cache: new Map(),
};

export default self;