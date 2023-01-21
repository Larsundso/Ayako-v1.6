import * as Jobs from 'node-schedule';
import * as Discord from 'discord.js';
import client from '../Client.js';

const MemberCache: {
  member: Discord.GuildMember;
  addRoles?: string[];
  removeRoles?: string[];
  prio: number;
  reason: string;
  added: number;
}[] = [];

const GuildCache: Map<
  string,
  { job: Jobs.Job; members: typeof MemberCache; guild: Discord.Guild }
> = new Map();

const roleManager = {
  add: async (member: Discord.GuildMember, roles: string[], reason: string, prio = 2) => {
    handleRoleUpdate(member, roles, reason, prio, 'addRoles');
  },
  remove: async (member: Discord.GuildMember, roles: string[], reason: string, prio = 2) => {
    handleRoleUpdate(member, roles, reason, prio, 'removeRoles');
  },
};

const handleRoleUpdate = async (
  member: Discord.GuildMember,
  roles: string[],
  reason: string,
  prio: number,
  type: 'addRoles' | 'removeRoles',
) => {
  const guild = client.guilds.cache.get(member.guild.id);
  if (!guild) return;

  const { me } = guild.members;
  if (!me) return;

  if (!member.manageable) return;
  if (!new Discord.PermissionsBitField(me.permissions).has(268435456n)) return;

  const roleGuild = GuildCache.get(guild.id);
  if (!roleGuild) {
    GuildCache.set(guild.id, {
      job: Jobs.scheduleJob('*/1 * * * * *', () => runJob(guild.id)),
      members: [{ member, [type]: roles, reason, prio, added: Date.now() }],
      guild,
    });
    return;
  }

  const existingEntry = MemberCache[MemberCache.findIndex((c) => c.member.id === member.id)];
  if (existingEntry) {
    existingEntry[type] = existingEntry[type]?.length
      ? [...new Set([...(existingEntry[type] as string[]), ...roles])]
      : roles;

    return;
  }

  MemberCache.push({ member, [type]: roles, prio, reason, added: Date.now() });
};

export default roleManager;

const runJob = async (guildID: string) => {
  const guild = client.guilds.cache.get(guildID);
  if (!guild) return;

  const memberCache = GuildCache.get(guildID);
  if (!memberCache) return;

  const prioSort = memberCache?.members.sort((a, b) => a.prio - b.prio);
  const highestPrio = prioSort[0]?.prio;
  if (!highestPrio) return;

  const prioFilter = memberCache?.members.filter((m) => m.prio === highestPrio);
  const dateFilter = prioFilter.sort((a, b) => b.added - a.added);
  const memberData = dateFilter[0];
  const roles = memberData.addRoles?.length
    ? [...memberData.member.roles.cache.map((r) => r), ...memberData.addRoles]
    : memberData.member.roles.cache.map((r) => r);
  const { me } = guild.members;
  const clientHighestRole = me?.roles.cache
    .sort((a, b) => b.position - a.position)
    .map((r) => r)
    .shift();
  if (!clientHighestRole) return;

  const editedRoles = roles.filter((r) => {
    const role = typeof r === 'string' ? memberCache.guild.roles.cache.get(r) : r;

    if (!role) return false;
    if (memberData.removeRoles?.includes(typeof r === 'string' ? r : r.id)) return false;
    if (clientHighestRole.position < role.position) return false;

    return true;
  });

  const roleAdd = await memberData.member
    .edit({
      roles: editedRoles,
    })
    .catch(() => null);
  if (!roleAdd) return;

  const index = memberCache.members.findIndex((m) => m.member.id === memberData.member.id);
  memberCache.members.splice(index, 1);

  if (!memberCache.members.length) {
    memberCache.job.cancel();
    GuildCache.delete(guildID);
  }
};