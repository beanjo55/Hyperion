import {IUtils} from "../types";

import {hoistUserResolver} from "./Resolvers";
import {resolveUser as userResolver} from "./Resolvers";
import {banResolver} from "./Resolvers";
import {strictResolver} from "./Resolvers";
import {sortRoles} from "./Roles";
import {getColor} from ".//Roles";
import {resolveRole} from "./Roles";
import {resolveTextChannel} from "./Channels";
import {resolveVoiceChannel} from "./Channels";
import {resolveCategory} from "./Channels";
import {resolveGuildChannel} from "./Channels";
import {hasUnicodeEmote} from "./Emote";
import {sanitizeQuotes} from "./Sanitize";
import {op8} from "./Resolvers";
import {multiArg} from "./Parse";

function input2boolean(input: string): boolean | undefined{
    input = input.toLowerCase().trim();
    if(input === "yes" || input === "true"){return true;}
    if(input === "no" || input === "false"){return false;}
    return;
}

function parseMessageLink(input: string): null | {guild: string; channel: string; message: string} {
    const rx = new RegExp(/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/, "gmi");
    const result = rx.exec(input);
    if(result === null){return null;}
    return {guild: result[3], channel: result[4], message: result[5]};
}

const utils: IUtils = {
    hoistResolver: hoistUserResolver,
    resolveUser: userResolver,
    sortRoles,
    getColor,
    resolveCategory,
    resolveTextChannel,
    resolveVoiceChannel,
    input2boolean,
    banResolver,
    strictResolver,
    resolveRole,
    resolveGuildChannel,
    parseMessageLink,
    hasUnicodeEmote,
    sanitizeQuotes,
    op8,
    multiArg
};
export default utils;