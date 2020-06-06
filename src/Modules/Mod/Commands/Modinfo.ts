import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, EmbedResponse, Field, IModerationContext, FieldArray} from "../../../types";
import {default as Mod} from "../Mod";
import { Member, User } from "eris";

class Modinfo extends Command{
    constructor(){
        super({
            name: "modinfo",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 3000,
            helpDetail: "Shows basic user info and moderation info for a user",
            helpUsage: "{prefix}modinfo [user]",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | EmbedResponse>{
        ctx.module = ctx.module as Mod;
        if(!ctx.args[0]){return "Please specify a user";}
        const user = await Hyperion.utils.banResolver(ctx.args[0], ctx.guild.members, Hyperion);
        if(!user){return "I dont know who that is, try a user ID";}
        const modstats = await Hyperion.managers.modlog.moderationCount(ctx.guild.id, user.id);
        const fields: FieldArray = [];
        if(user instanceof Member){
            const data: EmbedResponse = {
                embed: {
                    thumbnail: {url: user.avatarURL},
                    author: {
                        name: `${user.username}#${user.discriminator} | Mod Info`,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        icon_url: user.avatarURL
                    },
                    color: Hyperion.defaultColor,
                    footer: {text: `User ID: ${user.id}`},
                    timestamp: new Date,
                    fields: fields,
                    description: `${user.username}#${user.discriminator}`
                }
            };
            data.embed.fields!.push({name: "Registered At", value: new Date(user.createdAt).toDateString(), inline: true});
            data.embed.fields!.push({name: "Joined At", value: new Date(user.joinedAt).toDateString(), inline: true});
            data.embed.fields!.push({name: "In Server", value: "Yes", inline: true});
            data.embed.fields!.push({name: "Total Moderations", value: modstats[0].toString(), inline: true});
            data.embed.fields!.push({name: "Manual Moderations", value: modstats[1].toString(), inline: true});
            data.embed.fields!.push({name: "Auto Moderations", value: modstats[2].toString(), inline: true});
            if(user.roles.length === 0){
                data.embed.fields!.push({name: "Roles [0]", value: "None", inline: false});
            }else{
                const roles = Hyperion.utils.sortRoles(user.roles, ctx.guild.roles);
                data.embed.fields!.push({
                    name: `Roles [${roles.length}]`,
                    value: roles.map(r => r.mention).join(" "),
                    inline: false
                });
            }
            const recents = await Hyperion.managers.modlog.getUserModLogs(ctx.guild.id, user.id, 5);
            if(!recents || recents.length === 0){
                data.embed.fields!.push({name: "Recent Moderations", value: "No recent moderations", inline: false});
            }else{
                for(const recent of recents){
                    data.embed.fields!.push(await this.makeField(ctx.module.logToContext(recent, Hyperion), Hyperion));
                }
            }

            if(user.nick){
                data.embed.description = `${user.username}#${user.discriminator} **${user.nick}**\n${user.mention}`;
            }else{
                data.embed.description = `${user.username}#${user.discriminator}\n${user.mention}`;
            }

            return data;
        }

        if(user instanceof User){
            const data: EmbedResponse = {
                embed: {
                    thumbnail: {url: user.avatarURL},
                    author: {
                        name: `${user.username}#${user.discriminator} | Mod Info`,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        icon_url: user.avatarURL
                    },
                    color: Hyperion.defaultColor,
                    footer: {text: `User ID: ${user.id}`},
                    timestamp: new Date,
                    fields: fields,
                    description: `${user.username}#${user.discriminator}`
                }
            };
            data.embed.fields!.push({name: "Registered At", value: new Date(user.createdAt).toDateString(), inline: true});
            data.embed.fields!.push({name: "In Server", value: "No", inline: true});
            data.embed.fields!.push({name: "Total Moderations", value: modstats[0].toString(), inline: true});
            data.embed.fields!.push({name: "Manual Moderations", value: modstats[1].toString(), inline: true});
            data.embed.fields!.push({name: "Auto Moderations", value: modstats[2].toString(), inline: true});
            const recents = await Hyperion.managers.modlog.getUserModLogs(ctx.guild.id, user.id, 5);
            if(!recents || recents.length === 0){
                data.embed.fields!.push({name: "Recent Moderations", value: "No recent moderations", inline: false});
            }else{
                for(const recent of recents){
                    data.embed.fields!.push(await this.makeField(ctx.module.logToContext(recent, Hyperion), Hyperion));
                }
            }
            return data;
        }
        return "I couldnt find that user";
    }

    async makeField(ctx: IModerationContext, Hyperion: IHyperion): Promise<Field>{
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let moderator = Hyperion.client.users.get(ctx.moderator) ?? await Hyperion.client.getRESTUser(ctx.moderator).catch(() => {});
        moderator = moderator as User;
        const data: Field = {
            name: `Case ${ctx.case}`,
            value: `**Action:** ${Hyperion.modules.get("mod")!.actions[ctx.moderationType].friendlyName}\n**Date:** ${new Date(ctx.time).toDateString()}\n**Moderator:** ${moderator.username}#${moderator.discriminator}\n**Reason:** ${ctx.reason}`,
            inline: false
        };
        if(ctx.stringLength){
            data.value += `\n**Length:** ${ctx.stringLength}`;
        }
        return data;
    }
}
export default Modinfo;