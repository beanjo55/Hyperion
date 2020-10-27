import { Embed } from "eris";
import { findConfigFile } from "typescript";
import {Command} from "../../../Core/Structures/Command";
import {CommandResponse, ICommandContext, IHyperion} from "../../../types";
import Data from "../../Internal/Commands/Data";
const options = ["approve", "deny", "consider", "custom"];

class Reviewsuggest extends Command{
    constructor(){
        super({
            name: "reviewsuggest",
            aliases: ["rs"],
            userperms: ["mod"],
            module: "suggestions",

            helpDetail: "Manages the status of suggestions",
            noExample: true,
            helpUsage: "{prefix}rs approve [suggestion num] (reason)\n{prefix}rs deny [suggestion num] (reason)\n{prefix}rs consider [suggestion num] (reason)\n{prefix}rs custom [status] ; [suggestion num] (reason)"
        });
    }

    // eslint-disable-next-line complexity
    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0] || !options.includes(ctx.args[0].toLowerCase())){return {status: "neutral", response: "Please enter a valid option"};}
        if(ctx.args[0].toLowerCase() === "custom"){
            const shifted = ctx.args.slice(1).join(" ").split(";");
            if(!shifted[0]){return {status: "error", response: "Please enter a status"};}
            const status = shifted[0];
            const rest = shifted.slice(1).join(";").trim().split(" ");
            const config = ctx.guildConfig.suggestions;
            const suggestNum = Number(rest[0]);
            let reason = "No reason given";
            if(rest[1]){
                reason = rest.slice(1).join(" ");
            }
            if(isNaN(suggestNum) || suggestNum < 1){return {status: "error", response: "Please give a valid suggestion number"};}

            const suggestion = config.suggestions[suggestNum];
            if(!suggestion){return {status: "neutral", response: "That suggestion wasnt found in this server"};}
            let firstReview = true;
            if(suggestion.reviewer){firstReview = false;}
            suggestion.reviewer = ctx.user.id;
            suggestion.reason = reason;
            
            if(config.suggestionChannel !== ""){
                const channel = ctx.guild.channels.get(config.suggestionChannel);
                if(channel && (channel.type === 0 || channel.type === 5)){
                    const msg = channel.messages.get(suggestion.msg) ?? await channel.getMessage(suggestion.msg).catch(() => undefined);
                    if(msg){
                        if(!msg.embeds[0]){return {status: "error", response: "old suggestion failed to have an embed, this shouldnt happen"};}
                        const oldEmbed: {embed: Partial<Embed>} = {
                            embed: msg.embeds[0]
                        };
                        if(!oldEmbed.embed.fields){oldEmbed.embed.fields = [];}
                        oldEmbed.embed.title = `Suggestion ${suggestNum} | ${status}`;
                        if(!config.anonReviews){
                            if(oldEmbed.embed.fields?.[0] && oldEmbed.embed.fields[0].name === "Reviewed by"){
                                oldEmbed.embed.fields[0].value = `${ctx.user.username}#${ctx.user.discriminator} - (${ctx.user.id})`;
                            }else{
                                oldEmbed.embed.fields![0] = {name: "Reviewed by", value: `${ctx.user.username}#${ctx.user.discriminator} - (${ctx.user.id})`};
                            }
                        }
                        if(firstReview){
                            oldEmbed.embed.fields!.push({name: "Reason for status", value: reason.length > 1000 ? reason.substr(0, 1000) + "..." : reason});
                        }else{
                            oldEmbed.embed.fields![oldEmbed.embed.fields.length - 1] = {name: "Reason for status", value: reason.length > 1000 ? reason.substr(0, 1000) + "..." : reason};
                        }
                        oldEmbed.embed.color = Hyperion.colors.blue;
                        msg.edit(oldEmbed).catch(() => undefined);
                    }
                }
            }
            config.suggestions[suggestNum] = suggestion;
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "suggestions", config);
                return {status: "fancySuccess", response: "Successfully reviewed suggestion!"};
            }catch(err){
                return {status: "error", response: "Failed to review suggestion, err: " + err.message};
            }
            
        }else{
            const optData: {[key: string]: {color: number; channelOpt: string; name: string}} = {
                "approve": {color: Hyperion.colors.green, channelOpt: "approveChannel", name: "Approved"},
                "deny": {color: Hyperion.colors.red, channelOpt: "denyChannel", name: "Denied"},
                "consider": {color: Hyperion.colors.orange, channelOpt: "considerChannel", name: "Considered"}
            };
            const config = ctx.guildConfig.suggestions;
            const option = ctx.args[0].toLowerCase();
            const suggestNum = Number(ctx.args[1]);
            let reason = "No reason given";
            if(ctx.args[2]){
                reason = ctx.args.slice(2).join(" ");
            }
            if(isNaN(suggestNum) || suggestNum < 1){return {status: "error", response: "Please give a valid suggestion number"};}

            const suggestion = config.suggestions[suggestNum];
            if(!suggestion){return {status: "neutral", response: "That suggestion wasnt found in this server"};}
            let firstReview = true;
            if(suggestion.reviewer){firstReview = false;}
            suggestion.reviewer = ctx.user.id;
            suggestion.reason = reason;
            
            if(config.suggestionChannel !== ""){
                const channel = ctx.guild.channels.get(config.suggestionChannel);
                if(channel && (channel.type === 0 || channel.type === 5)){
                    const msg = channel.messages.get(suggestion.msg) ?? await channel.getMessage(suggestion.msg).catch(() => undefined);
                    if(msg){
                        if(!msg.embeds[0]){return {status: "error", response: "old suggestion failed to have an embed, this shouldnt happen"};}
                        const oldEmbed: {embed: Partial<Embed>} = {
                            embed: msg.embeds[0]
                        };
                        if(!oldEmbed.embed.fields){oldEmbed.embed.fields = [];}
                        oldEmbed.embed.title = `Suggestion ${suggestNum} | ${optData[option].name ?? "Error"}`;
                        if(!config.anonReviews){
                            if(oldEmbed.embed.fields?.[0] && oldEmbed.embed.fields[0].name === "Reviewed by"){
                                oldEmbed.embed.fields[0].value = `${ctx.user.username}#${ctx.user.discriminator} - (${ctx.user.id})`;
                            }else{
                                oldEmbed.embed.fields![0] = {name: "Reviewed by", value: `${ctx.user.username}#${ctx.user.discriminator} - (${ctx.user.id})`};
                            }
                        }
                        if(firstReview){
                            oldEmbed.embed.fields!.push({name: "Reason for status", value: reason.length > 1000 ? reason.substr(0, 1000) + "..." : reason});
                        }else{
                            oldEmbed.embed.fields![oldEmbed.embed.fields.length - 1] = {name: "Reason for status", value: reason.length > 1000 ? reason.substr(0, 1000) + "..." : reason};
                        }
                        oldEmbed.embed.color = optData[option].color;
                        msg.edit(oldEmbed).catch(() => undefined);
                    }
                }
            }
            const reportChannel = config[optData[option].channelOpt];
            if(reportChannel && typeof reportChannel === "string"){
                const channel = ctx.guild.channels.get(reportChannel);
                if(channel && (channel.type === 0 || channel.type === 5)){
                    const suggestor = Hyperion.client.users.get(suggestion.suggestor) ?? await Hyperion.client.getRESTUser(suggestion.suggestor).catch(() => undefined);
                    const data: {embed: Partial<Embed>} = {
                        embed: {
                            title: `Suggestion ${suggestNum} | ${optData[option].name ?? "Error"}`,
                            description: `__Suggested By: **${suggestor ? `${suggestor.username}#${suggestor.discriminator}` : "Unknown User"}**__\n${suggestion.description}`,
                            color: optData[option].color ?? Hyperion.colors.default,
                            timestamp: new Date(),
                            footer: {text: `User ID: ${suggestion.suggestor}`},
                            fields: []
                        }
                    };
                    if(!config.anonReviews){
                        data.embed.fields?.push({name: "Reviewed by", value: `${ctx.user.username}#${ctx.user.discriminator} - ${ctx.user.id}`});
                    }
                    data.embed.fields!.push({name: "Reason for status", value: reason.length > 1000 ? reason.substr(0, 1000) + "..." : reason});
                    channel.createMessage(data).catch(() => undefined);
                }
            }
            config.suggestions[suggestNum] = suggestion;
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "suggestions", config);
                return {status: "fancySuccess", response: "Successfully reviewed suggestion!"};
            }catch(err){
                return {status: "error", response: "Failed to review suggestion, err: " + err.message};
            }
            
        }
    }
}

export default Reviewsuggest;