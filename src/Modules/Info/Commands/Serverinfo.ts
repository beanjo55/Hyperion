import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {ICommandContext, IHyperion} from "../../../types";
// eslint-disable-next-line no-unused-vars
import { Role, Embed, GuildChannel } from "eris";

class Serverinfo extends Command{
    constructor(){
        super({
            name: "serverinfo",
            module: "info",

            helpDetail: "Shows info about the server",
            helpUsage: "{prefix}serverinfo",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | undefined>{
        const rolelist = ctx.guild.roles.filter((r: Role) => r.id !== ctx.guild.id).sort((a, b) => b.position - a.position).map((r: Role) => r.mention).join(" ");
        const owner = ctx.guild.members.get(ctx.guild.ownerID);
        if(!owner){return;}
        const data = {
            embed: {
                timestamp: new Date,
                color: Hyperion.defaultColor,
                title: `${ctx.guild.name} - Server Info`,
                thumbnail: {
                    url: ctx.guild.iconURL
                },
                footer: {
                    text: `ID: ${ctx.guild.id}`
                },
                fields: [
                    {
                        name: "Created At",
                        value: `${new Date(ctx.guild.createdAt).toDateString()}`,
                        inline: true
                    },
                    {
                        name: "Server Owner",
                        value: `${owner.username}#${owner.discriminator}`,
                        inline: true
                    },
                    {
                        name: "Members",
                        value: `${ctx.guild.members.size} Members`,
                        inline: true
                    },
                    {
                        name: "Channels",
                        value: `${ctx.guild.channels.size} Channels`,
                        inline: true
                    },
                    {
                        name: "Text Channels",
                        value: `${ctx.guild.channels.filter((c: GuildChannel) => c.type === 0).length} Text Channels`,
                        inline: true
                    },
                    {
                        name: "Voice Channels",
                        value: `${ctx.guild.channels.filter((c: GuildChannel) => c.type === 2).length} Voice Channels`,
                        inline: true
                    },
                    {
                        name: "News Channels",
                        value: `${ctx.guild.channels.filter((c: GuildChannel) => c.type === 5).length} News Channels`,
                        inline: true
                    },
                    {
                        name: "Channel Categories",
                        value: `${ctx.guild.channels.filter((c: GuildChannel) => c.type === 4).length} Categories`,
                        inline: true
                    }
                ]
            }
        };
        if(ctx.guild.emojis.length > 0){
            data.embed.fields.push({
                name: "Emotes",
                value: `${ctx.guild.emojis.length} Emotes`,
                inline: true
            });
        }
        if(rolelist.length > 1020){
            data.embed.fields.push({name: `Roles [${ctx.guild.roles.size-1}]`, value: `${ctx.guild.roles.size-1} Roles`, inline: false});
        }else{
            if(ctx.guild.roles.size === 0){
                data.embed.fields.push({name: "Roles", value: "This server has no roles", inline: false});
            }else{
                data.embed.fields.push({name: `Roles [${ctx.guild.roles.size-1}]`, value: rolelist, inline: false});
            }
        }
        return data;
    }
}
export default Serverinfo;