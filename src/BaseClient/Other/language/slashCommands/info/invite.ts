import * as CT from '../../../../../Typings/CustomTypings.js';

export default (t: CT.Language) => ({
 ...t.JSON.slashCommands.info.invite,
 author: t.stp(t.JSON.slashCommands.info.invite.author, { t }),
});