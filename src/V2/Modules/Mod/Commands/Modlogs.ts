import {Command} from "../../../Structures/Command";
import {IHyperion, ICommandContext, EmbedResponse, Field, IModerationContext, FieldArray} from "../../../types";
import {default as Mod} from "../Mod";
import { User } from "eris";


class Modlogs extends Command{
    constructor(){
        super({
            name: "modlogs",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 5000,
            helpDetail: "Shows moderation history for a user.",
            helpUsage: "{prefix}modlogs [user]\n{prefix}modlogs [user] -type [action type]",
            helpUsageExample: "{prefix}modlogs wuper\n{prefix}modlogs boss -type mute"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | EmbedResponse>{
        ctx.module = ctx.module as Mod;
        if(!ctx.args[0]){return "Please specify a user!";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        let targetstring = "";
        if(!target){
            targetstring = ctx.args[0];
        }else{
            targetstring = target.id;
        }

        if(!ctx.args[1]){
            const logs = await Hyperion.managers.modlog.getUserModLogs(ctx.guild.id, targetstring, {hideAuto: true, page: 0});
            if(!logs || logs.length === 0){return "No logs found!";}
            const fieldarr: FieldArray = [];
            const data: EmbedResponse = {
                embed: {
                    title: "User Mod Logs",
                    timestamp: new Date,
                    color: Hyperion.colors.default,
                    fields: fieldarr
                }
            };
            for(const log of logs){
                data.embed.fields!.push(await this.makeField(await ctx.module.logToContext(log, Hyperion), Hyperion));
            }
            if(target){
                data.embed.title = `Mod Logs for ${target.username}#${target.discriminator}`;
                data.embed.footer = {text: `User ID: ${target.id}`};
            }else{
                data.embed.footer = {text: `User ID: ${targetstring}`};
            }
            return data;

        }
        if(ctx.args[1] && ctx.args[1] === "-type"){
            if(!ctx.args[2]){return "You need to specify a type of mod action when using the `-type` option.";}
            const action = ctx.module.actions[ctx.args[2].toLowerCase()];
            if(!action){return "Invalid user provided, try their user ID or mention.";}
            const logs = await Hyperion.managers.modlog.getUserModLogs(ctx.guild.id, targetstring, {filter: ctx.args[2].toLowerCase(), hideAuto: true, page: 0});
            if(!logs || logs.length === 0){return "No logs found!";}
            const fieldarr: FieldArray = [];
            const data: EmbedResponse = {
                embed: {
                    title: "User Mod Logs",
                    timestamp: new Date,
                    color: Hyperion.colors.default,
                    fields: fieldarr
                }
            };
            for(const log of logs){
                data.embed.fields!.push(await this.makeField(await ctx.module.logToContext(log, Hyperion), Hyperion));
            }
            if(target){
                data.embed.title = `Mod Logs for ${target.username}#${target.discriminator}`;
                data.embed.footer = {text: `User ID: ${target.id}`};
            }else{
                data.embed.footer = {text: `User ID: ${targetstring}`};
            }
            return data;
        }
        return "e";
    }

    async makeField(ctx: IModerationContext, Hyperion: IHyperion): Promise<Field>{
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let moderator = Hyperion.client.users.get(ctx.moderator) ?? await Hyperion.client.getRESTUser(ctx.moderator).catch(() => {});
        moderator = moderator as User;
        const data: Field = {
            name: `Case ${ctx.caseNumber}`,
            value: `**Action:** ${Hyperion.modules.get("mod")!.actions[ctx.moderationType]?.friendlyName || "Unknown"}\n**Date:** ${new Date(ctx.timeGiven).toDateString()}\n**Moderator:** ${moderator.username}#${moderator.discriminator}\n**Reason:** ${ctx.reason}`,
            inline: false
        };
        if(ctx.stringLength){
            data.value += `\n**Length:** ${ctx.stringLength}`;
        }
        return data;
    }
}
export default Modlogs;