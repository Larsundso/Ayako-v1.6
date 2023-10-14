import * as Discord from 'discord.js';
import reply from './replyCmd.js';
import objectEmotes from './emotes.js';
import constants from '../Other/constants.js';
import type CT from '../../Typings/CustomTypings.js';
import isEditable from './isEditable.js';
import { request } from './requestHandler.js';

/**
 * Sends an error message to the user in response to an interaction.
 * @param cmd - The interaction that triggered the error.
 * @param content - The error message to send.
 * @param language - The language object containing localized strings.
 * @param m - Optional existing message to edit instead of sending a new one.
 * @returns A Promise that resolves to the sent message.
 */
export default async (
 cmd:
  | Discord.ButtonInteraction
  | Discord.CommandInteraction
  | Discord.AnySelectMenuInteraction
  | Discord.ModalSubmitInteraction,
 content: string | Error,
 language: CT.Language,
 m?: Discord.InteractionResponse | Discord.Message<true>,
) => {
 const embed: Discord.APIEmbed = {
  author: {
   name: language.error,
   icon_url: objectEmotes.warning.link,
   url: constants.standard.invite,
  },
  color: constants.colors.danger,
  description:
   typeof content === 'string' ? content : content.message.split(/:+/g).slice(1, 100).join(':'),
 };

 if (
  (m && m instanceof Discord.Message && (await isEditable(m))) ||
  m instanceof Discord.InteractionResponse
 ) {
  if (m instanceof Discord.InteractionResponse) m.edit({ embeds: [embed] }).catch(() => undefined);
  else request.channels.editMsg(m, { embeds: [embed] });
 }

 return reply(cmd, { embeds: [embed], ephemeral: true });
};
