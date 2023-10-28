import { Prisma } from '@prisma/client';
import * as CT from '../../../../Typings/CustomTypings.js';

/**
 * Parser for number type settings.
 * @param val - The number value to parse.
 * @param language - The language object containing translations.
 * @returns A string representation of the number value.
 */
export default (val: string | number | Prisma.Decimal | null, language: CT.Language) =>
 val ? String(val) : language.None;