import * as Discord from 'discord.js';
import Jobs from 'node-schedule';
import fetch from 'node-fetch';
import Prisma from '@prisma/client';
import * as ch from '../../../BaseClient/ClientHelper.js';
import auth from '../../../auth.json' assert { type: 'json' };
import CT from '../../../Typings/CustomTypings.js';
import pack from '../../../../package.json' assert { type: 'json' };
import * as VirusVendorsTypings from '../../../Typings/VirusVendorsTypings.js';

type VendorType = 'Kaspersky' | 'Google Safe Browsing' | 'PromptAPI' | 'VirusTotal';

const highlyCredibleVTVendors = [
 'Yandex Safebrowsing',
 'Google Safebrowsing',
 'Kaspersky',
 'BitDefender',
];

const cleanURL = (s: string) =>
 s.replace('https://', '').replace('http://', '').replace('www.', '').split(/\/+/g)[0];

export default async (msg: Discord.Message<true>) => {
 if (!msg.content) return;
 if (msg.author.bot) return;

 const settings = await ch.DataBase.antivirus.findUnique({
  where: { guildid: msg.guildId, active: true },
 });
 if (!settings) return;

 const url = await run(msg.content);
 if (!url.url) return;

 const language = await ch.getLanguage(msg.guildId);

 if (settings.linklogging && settings.linklogchannels.length) {
  // TODO: extended logging with new results
  ch.send(
   { id: settings.linklogchannels, guildId: msg.guildId },
   {
    embeds: [
     {
      color: url.triggers ? ch.constants.colors.danger : ch.constants.colors.success,
      author: {
       name: language.deleteReasons.antivirus,
       icon_url: ch.constants.events.logs.invite.create,
      },
      description: language.antivirus.log.value(msg),
      fields: [
       {
        name: language.antivirus.log.name,
        value: url.urls.map((u) => ch.util.makeInlineCode(u)).join('\n'),
       },
       ...(url.url
        ? [
           {
            name: language.antivirus.malicious(
             ch.constants.standard.getEmote(ch.emotes.crossWithBackground),
            ),
            value: ch.util.makeInlineCode(url.url),
           },
          ]
        : []),
      ],
     },
    ],
   },
  );
 }

 if (!url.triggers) return;
 performPunishment(msg, settings, language, msg);
};

const run = async (content: string) => {
 const urls = await getURLs(content);
 let resolved = false;

 const triggersAV:
  | undefined
  | {
     triggers: boolean;
     url: string;
     result?:
      | VirusVendorsTypings.Kaspersky
      | VirusVendorsTypings.GoogleSafeBrowsing
      | VirusVendorsTypings.PromptAPI
      | VirusVendorsTypings.VirusTotalAnalyses;
     type?: VendorType;
     // eslint-disable-next-line no-async-promise-executor
    } = await new Promise(async (res) => {
  for (let i = 0; i < urls.length; i += 1) {
   if (resolved) return;

   // eslint-disable-next-line no-await-in-loop
   const result = await getTriggersAV(urls[i]);
   if (!result.triggers) return;

   resolved = true;
   res({ triggers: true, url: urls[i], result: result.result, type: result.type });
  }

  if (!resolved) res(undefined);
 });

 if (!triggersAV?.triggers) return { triggers: false, urls, url: triggersAV?.url };

 reportFishFish(triggersAV.url);

 return {
  triggers: true,
  urls,
  url: triggersAV.url,
  result: triggersAV.result,
  type: triggersAV.type,
 };
};

const getURLs = async (content: string): Promise<string[]> => {
 if (!content.match(ch.regexes.urlTester(ch.cache.urlTLDs.toArray()))) return [];

 const args = content.split(/(\s+|\n+)/g);
 const argsContainingLink = args
  .filter((a) => a.includes('.'))
  .filter((arg) => arg.match(ch.regexes.urlTester(ch.cache.urlTLDs.toArray())));

 return (await Promise.all(argsContainingLink.map((arg) => ch.fetchWithRedirects(arg)))).flat();
};

const getTriggersAV = async (
 url: string,
): Promise<{
 url: string;
 type?: VendorType;
 result?:
  | VirusVendorsTypings.Kaspersky
  | VirusVendorsTypings.GoogleSafeBrowsing
  | VirusVendorsTypings.PromptAPI
  | VirusVendorsTypings.VirusTotalAnalyses;
 triggers: boolean;
}> => {
 const websiteResponse = await checkIfExists(url);
 if (!websiteResponse) return { url, triggers: false };

 if (await inFishFish(url)) return { url, triggers: true };
 if (inSinkingYachts(url)) return { url, triggers: true };
 if (await inSpamHaus(url)) return { url, triggers: true };

 const kaspersky = await inKaspersky(url);
 if (kaspersky.triggered) {
  return { url, type: 'Kaspersky', result: kaspersky.result, triggers: true };
 }

 const googleSafeBrowsing = await inGoogleSafeBrowsing(url);
 if (googleSafeBrowsing.triggers) {
  return { url, type: 'Google Safe Browsing', result: googleSafeBrowsing.result, triggers: true };
 }

 const promptAPI = await ageCheck(url);
 if (promptAPI.triggers) {
  return { url, triggers: true, result: promptAPI.result, type: 'PromptAPI' };
 }

 const virusTotal = await inVT(url);
 if (virusTotal.triggers && virusTotal.result !== false && typeof virusTotal.result !== 'string') {
  return { url, triggers: true, result: virusTotal.result, type: 'VirusTotal' };
 }

 return { triggers: false, url };
};

const checkIfExists = async (url: string) => {
 try {
  return (await fetch(url.startsWith('http') ? url : `http://${url}`, { method: 'HEAD' })).ok;
 } catch {
  return false;
 }
};

// https://phish.sinking.yachts/
const inSinkingYachts = (u: string) => ch.cache.sinkingYachts.cache.has(cleanURL(u));

const inSpamHaus = async (u: string) => {
 const res = await fetch(`https://apibl.spamhaus.net/lookup/v1/dbl/${cleanURL(u)}`, {
  headers: {
   Authorization: `Bearer ${auth.spamhausToken}`,
   'Content-Type': 'application/json',
  },
 });

 return res.status === 200;
};

const ageCheck = async (u: string) => {
 const res = await fetch(`https://api.promptapi.com/whois/query?domain=${cleanURL(u)}`, {
  headers: { apikey: auth.promptAPIToken },
 });

 if (!res.ok) return { triggers: false };

 const json = (await res.json()) as VirusVendorsTypings.PromptAPI;
 if (json.result === 'not found') return { triggers: false, type: 'PromptAPI' };

 const ageInDays = Math.ceil(
  Math.abs(new Date(json.result.creation_date).getTime() + new Date().getTime()) /
   (1000 * 3600 * 24),
 );

 return { triggers: ageInDays < 8, type: 'PromptAPI', result: json };
};

const inVT = async (u: string) => {
 const body = new FormData();
 body.set('url', u);

 const urlsRes = await fetch('https://www.virustotal.com/api/v3/urls', {
  method: 'POST',
  headers: {
   'x-apikey': auth.VTtoken,
  },
  body,
 });

 if (!urlsRes.ok) return { triggers: false };

 const urlsData = (await urlsRes.json()) as VirusVendorsTypings.VirusTotalURLs;
 const analysesData = await getAnalyses(urlsData.data.id);
 if (typeof analysesData === 'string') return { triggers: false };

 return getSeverity(analysesData)
  ? { triggers: true, result: analysesData, type: 'VirusTotal' }
  : { triggers: false };
};

const getAnalyses = async (
 id: string,
 i = 1,
): Promise<false | string | VirusVendorsTypings.VirusTotalAnalyses> => {
 if (i > 5) throw new Error('Too many requests');

 return new Promise((resolve) => {
  Jobs.scheduleJob(new Date(Date.now() + 5000 * i), async () => {
   const res = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
    headers: {
     'x-apikey': auth.VTtoken,
    },
   });
   if (!res.ok) return resolve((await res.text()) as string);

   const data = (await res.json()) as VirusVendorsTypings.VirusTotalAnalyses;
   if (typeof data === 'string') return resolve(false);

   if (data.data.attributes.status === 'completed') return resolve(data);
   return resolve(await getAnalyses(id, i + 1));
  });
 });
};

const getSeverity = (result: VirusVendorsTypings.VirusTotalAnalyses | false) => {
 if (!result) return false;
 if (
  Object.entries(result.data.attributes.results).filter(
   ([, v]) =>
    ['malicious', 'suspicious'].includes(v.category) &&
    highlyCredibleVTVendors.includes(v.engine_name),
  )
 ) {
  return true;
 }

 return result.data.attributes.stats.malicious + result.data.attributes.stats.suspicious > 5;
};

const inGoogleSafeBrowsing = async (u: string) => {
 const res = await fetch(
  `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${auth.safeBrowsingToken}`,
  {
   method: 'POST',
   body: JSON.stringify({
    client: {
     clientId: 'Ayako Development',
     clientVersion: pack.version,
    },
    threatInfo: {
     threatTypes: [
      'MALWARE',
      'SOCIAL_ENGINEERING',
      'UNWANTED_SOFTWARE',
      'POTENTIALLY_HARMFUL_APPLICATION',
     ],
     platformTypes: ['ALL_PLATFORMS'],
     threatEntryTypes: ['URL'],
     threatEntries: [
      {
       url: u,
      },
     ],
    },
   }),
  },
 );

 if (!res.ok) return { triggers: false, type: 'Google Safe Browsing' };

 const json = (await res.json()) as VirusVendorsTypings.GoogleSafeBrowsing;
 if (json.matches.length) {
  return { triggers: true, type: 'Google Safe Browsing', result: json };
 }

 return { triggers: false, type: 'Google Safe Browsing' };
};

const reportFishFish = (u: string) => {
 fetch('https://yuri.bots.lostluma.dev/phish/report', {
  method: 'POST',
  headers: {
   authorization: auth.phishToken,
  },
  body: JSON.stringify({
   url: u,
   reason:
    'Reported by at least one of the following Vendors: Google Safe Browsing, SpamHaus, VirusTotal, Sinking Yachts, PromptAPI, FishFish',
  }),
 });
};

// https://api.fishfish.gg/v1/docs
const inFishFish = async (u: string) => ch.cache.fishFish.cache.has(cleanURL(u));

const inKaspersky = async (u: string) => {
 const res = await fetch(
  `https://opentip.kaspersky.com/api/v1/search/domain?request=${cleanURL(u)}`,
  {
   headers: {
    'x-api-key': auth.kasperskyKey,
   },
  },
 );

 if (res.ok) return { triggered: false };

 const json = (await res.json()) as VirusVendorsTypings.Kaspersky;
 if (json.Zone === 'Red') return { triggered: true, type: 'Kaspersky', result: json };

 return { triggered: false, type: 'Kaspersky', result: json };
};

export const performPunishment = (
 rawMessage: Discord.Message<true> | undefined,
 settings: Prisma.antivirus | Prisma.antispam,
 language: CT.Language,
 additionalData: Discord.Message<true>,
) => {
 const msg = rawMessage ?? additionalData;

 const baseOptions = {
  dbOnly: false,
  reason: language.deleteReasons.antivirus,
  executor: msg.client.user,
  target: msg.author,
  guild: msg.guild,
  skipChecks: false,
 };

 switch (settings.action) {
  case 'ban':
   return ch.mod(msg, 'banAdd', {
    ...baseOptions,
    deleteMessageSeconds: Number(settings.deletemessageseconds),
   });
  case 'channelban':
   return ch.mod(msg, 'channelBanAdd', {
    ...baseOptions,
    channel: msg.channel.isThread()
     ? (msg.channel.parent as NonNullable<typeof msg.channel.parent>)
     : msg.channel,
   });
  case 'kick':
   return ch.mod(msg, 'kickAdd', baseOptions);
  case 'softban':
   return ch.mod(msg, 'softBanAdd', {
    ...baseOptions,
    deleteMessageSeconds: Number(settings.deletemessageseconds),
   });
  case 'strike':
   return ch.mod(msg, 'strikeAdd', baseOptions);
  case 'warn':
   return ch.mod(msg, 'warnAdd', baseOptions);
  case 'tempban':
   return ch.mod(msg, 'tempBanAdd', {
    ...baseOptions,
    deleteMessageSeconds: Number(settings.deletemessageseconds),
    duration: Number(settings.duration),
   });
  case 'tempchannelban':
   return ch.mod(msg, 'tempChannelBanAdd', {
    ...baseOptions,
    channel: msg.channel.isThread()
     ? (msg.channel.parent as NonNullable<typeof msg.channel.parent>)
     : msg.channel,
    duration: Number(settings.duration),
   });
  case 'tempmute':
   return ch.mod(msg, 'tempMuteAdd', { ...baseOptions, duration: Number(settings.duration) });
  default:
   throw new Error(`Invalid action: ${settings.action}`);
 }
};
