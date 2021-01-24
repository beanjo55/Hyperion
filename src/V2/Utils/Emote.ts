const unicodeList = require("emoji.json/emoji-compact.json");


export function hasUnicodeEmote(input: string): boolean{
    return unicodeList.includes(input);
}