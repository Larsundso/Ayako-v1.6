import * as Jobs from 'node-schedule';

/**
 * Interface for managing vc mutes in the bot's cache.
 */
export interface VcMutes {
 /**
  * Adds a vc mute job to the cache for the specified guild and user.
  * @param job - The mute job to add to the cache.
  * @param guildId - The ID of the guild where the user is being muted.
  * @param userId - The ID of the user being muted.
  */
 set: (job: Jobs.Job, guildId: string, userId: string) => void;

 /**
  * Removes the vc mute job from the cache for the specified guild and user.
  * @param guildId - The ID of the guild where the user is being muted.
  * @param userId - The ID of the user being muted.
  */
 delete: (guildId: string, userId: string) => void;

 /**
  * The cache of vc mute jobs, organized by guild ID and user ID.
  */
 cache: Map<string, Map<string, Jobs.Job>>;
}

const self: VcMutes = {
 set: (job, guildId, userId) => {
  const cached = self.cache.get(guildId)?.get(userId);
  cached?.cancel();

  if (!self.cache.get(guildId)) self.cache.set(guildId, new Map());
  self.cache.get(guildId)?.set(userId, job);
 },
 delete: (guildId, userId) => {
  const cached = self.cache.get(guildId)?.get(userId);
  cached?.cancel();

  if (self.cache.get(guildId)?.size === 1) self.cache.delete(guildId);
  else self.cache.get(guildId)?.delete(userId);
 },
 cache: new Map(),
};

export default self;
