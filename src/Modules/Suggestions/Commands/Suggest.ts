import { Embed } from "eris";
import { config } from "signale";
import {Command} from "../../../Core/Structures/Command";
import {CommandResponse, ICommandContext, IHyperion} from "../../../types";

class Suggest extends Command{
    constructor(){
        super({
            name: "suggest",
            module: "suggestions",
            helpDetail: "Creates a new suggestion",
            helpUsage: "{prefix}suggest [your suggestion]\n{prefix}suggest status [suggestion number]",
            helpUsageExample: "{prefix}suggest add a dog picture channel\n{prefix}suggest status 1"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return {status: "error", response: "Please give something to suggest!"};}
        if(ctx.args[0].toLowerCase() === "status"){return await this.status(ctx, Hyperion);}
        if(ctx.guildConfig.suggestions.suggestionChannel === ""){return {status: "error", response: "Please ask a server manager to set a suggestion channel!"};}
        const channel = ctx.guild.channels.get(ctx.guildConfig.suggestions.suggestionChannel);
        if(!channel || !(channel.type === 0 || channel.type === 5)){return {status: "error", response: "The suggestion channel is invalid, please ask a server manager to reset it"};}
        const suggestNum = ctx.guildConfig.suggestions.lastSuggestion + 1;
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: `Suggestion ${suggestNum} | Not Reviewed`,
                color: Hyperion.colors.yellow,
                timestamp: new Date,
                description: `__Suggested By: **${ctx.user.username}#${ctx.user.discriminator}**__\n` + ctx.args.slice(0).join(" "),
                footer: {text: `User ID: ${ctx.user.id}`}
            }
        };
        const msg = await channel.createMessage(data).catch(() => undefined);
        if(!msg){
            return {status: "error", response: "Could not create the suggestion in the channel"};
        }
        ctx.guildConfig.suggestions.suggestions[suggestNum] = {
            suggestor: ctx.user.id,
            status: "none",
            msg: msg.id,
            description: ctx.args.slice(0).join(" ")
        };
        ctx.guildConfig.suggestions.lastSuggestion = suggestNum;
        try{
            await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "suggestions", ctx.guildConfig.suggestions);
            return {status: "fancySuccess", response: "Successfully created your suggestion! Your suggestion is number " + suggestNum};
        }catch(err){
            msg.delete().catch(() => undefined);
            return {status: "error", response: "Failed to create your suggestion, err: " + err.message};
        }

    }

    // eslint-disable-next-line complexity
    async status(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[1]){return {status: "neutral", response: "Please enter a suggestion to check the status of"};}
        const suggestNum = Number(ctx.args[1]);
        if(isNaN(suggestNum) || suggestNum < 1){return {status: "error", response: "Please eneter a valid suggestion number"};}
        const suggestion = ctx.guildConfig.suggestions.suggestions[suggestNum];
        if(!suggestion){return {status: "error", response: "That suggestion wasnt found"};}
        if(!ctx.guildConfig.suggestions.checkOtherSuggestions && !ctx.mod && ctx.user.id !== suggestion.suggestor){return {status: "error", response: "You can only check the status of suggestions you made in this server"};}
        const suggestor = Hyperion.client.users.get(suggestion.suggestor) ?? await Hyperion.client.getRESTUser(suggestion.suggestor).catch(() => undefined);
        const data: {embed: Partial<Embed>} = {
            embed: {
                title: `Suggestion ${suggestNum} | `,
                timestamp: new Date,
                description: `__Suggested By : **${suggestor ? `${suggestor.username}#${suggestor.discriminator}`: "Unknown User"}**__\n` + suggestion.description,
                fields: [],
                footer: {text: `User ID: ${suggestion.suggestor}`}
            }
        };
        if(suggestion.cStatus){
            data.embed.title += suggestion.cStatus;
            data.embed.color = Hyperion.colors.blue;
            if(!ctx.guildConfig.suggestions.anonReviews && suggestion.reviewer){
                const reviewer = Hyperion.client.users.get(suggestion.reviewer) ?? await Hyperion.client.getRESTUser(suggestion.reviewer).catch(() => undefined);
                data.embed.fields?.push({name: "Reviewed by", value: reviewer ? `${reviewer.username}#${reviewer.discriminator} - (${reviewer.id})` : `Unknown User - (${suggestion.reviewer})`});
            }
            if(suggestion.reason){
                data.embed.fields?.push({name: "Reason for status", value: suggestion.reason});
            }
        }else{
            if(suggestion.status === "accepted"){
                data.embed.title += "Accepted";
                data.embed.color = Hyperion.colors.green;
                if(!ctx.guildConfig.suggestions.anonReviews && suggestion.reviewer){
                    const reviewer = Hyperion.client.users.get(suggestion.reviewer) ?? await Hyperion.client.getRESTUser(suggestion.reviewer).catch(() => undefined);
                    data.embed.fields?.push({name: "Reviewed by", value: reviewer ? `${reviewer.username}#${reviewer.discriminator} - (${reviewer.id})` : `Unknown User - (${suggestion.reviewer})`});
                }
                if(suggestion.reason){
                    data.embed.fields?.push({name: "Reason for accept", value: suggestion.reason});
                }
            }
            if(suggestion.status === "denied"){
                data.embed.title += "Denied";
                data.embed.color = Hyperion.colors.red;
                if(!ctx.guildConfig.suggestions.anonReviews && suggestion.reviewer){
                    const reviewer = Hyperion.client.users.get(suggestion.reviewer) ?? await Hyperion.client.getRESTUser(suggestion.reviewer).catch(() => undefined);
                    data.embed.fields?.push({name: "Reviewed by", value: reviewer ? `${reviewer.username}#${reviewer.discriminator} - (${reviewer.id})` : `Unknown User - (${suggestion.reviewer})`});
                }
                if(suggestion.reason){
                    data.embed.fields?.push({name: "Reason for deny", value: suggestion.reason});
                }
            }
            if(suggestion.status === "considered"){
                data.embed.title += "Considered";
                data.embed.color = Hyperion.colors.orange;
                if(!ctx.guildConfig.suggestions.anonReviews && suggestion.reviewer){
                    const reviewer = Hyperion.client.users.get(suggestion.reviewer) ?? await Hyperion.client.getRESTUser(suggestion.reviewer).catch(() => undefined);
                    data.embed.fields?.push({name: "Reviewed by", value: reviewer ? `${reviewer.username}#${reviewer.discriminator} - (${reviewer.id})` : `Unknown User - (${suggestion.reviewer})`});
                }
                if(suggestion.reason){
                    data.embed.fields?.push({name: "Reason for status", value: suggestion.reason});
                }
            }
            if(suggestion.status === "none"){
                data.embed.title += "Not Reviewed";
                data.embed.color = Hyperion.colors.yellow;
            }
        }
        return data;
    }
}
export default Suggest;