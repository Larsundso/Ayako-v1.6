import * as DiscordRest from '@discordjs/rest';
import * as DiscordCore from '@discordjs/core';
import * as CT from '../../Typings/CustomTypings';
import cache from './cache.js';
import { API } from '../Client.js';

import commands from './requestHandler/commands.js';
import channels from './requestHandler/channels.js';
import guilds from './requestHandler/guilds.js';
import webhooks from './requestHandler/webhooks.js';
import interactions from './requestHandler/interactions.js';
import invites from './requestHandler/invites.js';
import stageInstances from './requestHandler/stageInstances.js';
import stickers from './requestHandler/stickers.js';
import threads from './requestHandler/threads.js';
import users from './requestHandler/users.js';
import voice from './requestHandler/voice.js';

export default async (guildId: string, token: string) => {
 const rest = new DiscordRest.REST({ version: '10' }).setToken(token);
 const api = new DiscordCore.API(rest as CT.Argument<typeof DiscordCore.API, 0>);
 cache.apis.set(guildId, api);
};

export const request = {
 commands,
 channels,
 guilds,
 webhooks,
 interactions,
 invites,
 oAuth2: API.oauth2,
 roleConnections: API.roleConnections,
 stageInstances,
 stickers,
 threads,
 users,
 voice,
};