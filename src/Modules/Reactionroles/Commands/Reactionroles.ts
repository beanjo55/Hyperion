/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";
import {ReactionRole, RRConfig} from "../../../Core/Managers/MongoGuildManager";
import {default as rrM} from "../Reactionroles";
import HyperionC from "../../../main";
import { convertCompilerOptionsFromJson } from "typescript";
import { GuildTextableChannel, Message } from "eris";

class Reactionroles extends Command{
    constructor(){
        super({
            name: "reactionroles",
            aliases: ["rr", "reactionrole"],
            listUnder: "manager",
            module: "reactionroles",
            userperms: ["manager"],
            helpDetail: "Manages reaction roles",
            hasSub: true
        });
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        return await this.list(ctx, Hyperion);
    }

    async list(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const data = await ctx.module.getConfig(ctx.guild.id);
        let out = "";
        data.rr.forEach((rr, name) => {
            out += `${name} - ${rr.erMap.size ?? 0} Roles\n`;
        });
        if(out === ""){out = "No Reaction Roles setup";}
        return {
            embed: {
                color: Hyperion.colors.blue,
                timestamp: new Date,
                title: "Reaction Roles",
                description: out
            }
        };
    }

    isEmote(input: string, Hyperion: IHyperion): boolean {
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        const result = EmoteRegex.exec(input);
        if(result){return true;}
        return Hyperion.utils.hasUnicodeEmote(input);
    }

    parseEmote(input: string, Hyperion: IHyperion): {name: string; id?: string, full: string} | undefined {
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        const result = EmoteRegex.exec(input);
        if(result){
            return {name: result[2], id: result[3], full: input};
        }
        if(Hyperion.utils.hasUnicodeEmote(input)){return {name: input, full: input};}
    }
}

class List extends Reactionroles{
    constructor(){
        super();
        this.name = "list";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        return await this.list(ctx, Hyperion);
    }
}

class Create extends Reactionroles{
    constructor(){
        super();
        this.name = "create";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the new reaction role"};}
        try{
            await ctx.module.createRR(ctx.guild.id, name);
            return {status: "success", response: "Added reaction role " + name};
        }catch(err){
            return {status: "error", response: err.message};
        }
    }
}

class Delete extends Reactionroles{
    constructor(){
        super();
        this.name = "delete";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the reaction role to delete"};}
        try{
            await ctx.module.deleteRR(ctx.guild.id, name);
            return {status: "success", response: "Removed reaction role " + name};
        }catch(err){
            return {status: "error", response: err.message};
        }
    }
}

class Add extends Reactionroles{
    constructor(){
        super();
        this.name = "add";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the reaction role to add to"};}
        const emote = ctx.args[2];
        if(!ctx.module.isEmote(emote)){return {status: "error", response: "Please give a valid emote"};}
        const role = ctx.args[3];
        const realRole = Hyperion.utils.resolveRole(role, ctx.guild.roles);
        if(!realRole){return {status: "error", response: "Please specify a valid role"};}
        try{
            await ctx.module.addRole(ctx.guild.id, name, emote, realRole.id);
            return {status: "success", response: "Added the emote/role pair to " + name};
        }catch(err){
            return {status: "error", response: err.message};
        }
    }
}

class Remove extends Reactionroles{
    constructor(){
        super();
        this.name = "remove";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the reaction role to remove from"};}
        const emote = ctx.args[2];
        try{
            await ctx.module.delRole(ctx.guild.id, name, emote);
            return {status: "success", response: "Removed the emote/role pair from " + name};
        }catch(err){
            return {status: "error", response: err.message};
        }
    }
}

class Show extends Reactionroles{
    constructor(){
        super();
        this.name = "show";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a reaction role to show"};}
        const config = await ctx.module.getConfig(ctx.guild.id);
        const rr = config.rr.get(name);
        if(!rr){return {status: "error", response: "Coundnt find a reaction role by that name in the server"};}
        let string = "";
        if(rr.erMap.size === 0){
            string = "This reaction role has no emote/role pairs added";
        }else{
            rr.erMap.forEach((role, emote) => string += `${emote} - ${ctx.guild.roles.get(role)?.mention ?? "Deleted Role"}\n`);
        }

        const data = {
            embed: {
                title: `Reaction Role: ${name}`,
                description: "__Emote - Role pairs__\n" + string,
                color: Hyperion.colors.blue,
                timestamp: new Date
            }
        };
        return data;
    }
}

class Post extends Reactionroles{
    constructor(){
        super();
        this.name = "post";
        this.id = this.name;
        this.aliases = [];
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        const channel = ctx.args[2];
        if(!name){return {status: "error", response: "Please specify a reaction role to post"};}
        if(!channel){return {status: "error", response: "Please specify a channel to post the reaction role in"};}
        const channelObj = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, channel);
        if(!channelObj){return {status: "error", response: "Couldnt find that channel"};}
        const config = await ctx.module.getConfig(ctx.guild.id);
        const rr = config.rr.get(name);
        if(!rr){return {status: "error", response: "Couldnt find that reaction role"};}
        if(rr.linkedMessages.length > 0){return {status: "neutral", response: "That reaction role has already been posted"};}
        const title = ctx.args.length >= 3 ? ctx.args.slice(3).join(" ") : "Reaction Role";
        const names: Array<string> = [];
        rr.erMap.forEach((role, emote) => {
            const rle = ctx.guild.roles.get(role);
            names.push(`${emote} - ${rle?.mention ?? "Unknown Role"}`);
        });
        const data = {
            embed: {
                description: `React to the emotes to get these roles:\n${names.join(", ")}`,
                title,
                timestamp: new Date,
                color: Hyperion.colors.default
            }
        };
        if(!ctx.module.checkAddPerms(channelObj)){return {status: "error", response: "I dont have permissions to read message history and/or add reactions in that channel"};}
        try{
            const message = await channelObj.createMessage(data);
            const result = await ctx.module.addReactions([...rr.erMap.keys()], message);
            if(result.failed.length === 0){
                config.rrMessages.set(message.id, name);
                rr.linkedMessages.push(message.id);
                config.rr.set(name, rr);
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "reactionroles", config);
                return {status: "fancySuccess", response: "Successfully posted reaction role!"};
            }else{
                message.delete().catch(() => undefined);
                return {status: "error", response: `Couldnt add reaction ${result.failed[0]}, for the reason: ${result.reason}`};
            }
        }catch(err){
            return {status: "error", response: "Something went wrong, " + err.message};
        }
    }
}

class Reset extends Reactionroles{
    constructor(){
        super();
        this.name = "reset";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the reaction role to reset linked messages for"};}
        try{
            const config = await ctx.module.getConfig(ctx.guild.id);
            if(!config.rr.has(name)){return {status: "neutral", response: "I couldnt find that reaction role in this server"};}
            const rr = config.rr.get(name);
            rr!.linkedMessages = [];
            config.rr.set(name, rr!);
            config.rrMessages.forEach((key, msg) => {if(key === name){config.rrMessages.delete(msg);}});
            await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "reactionroles", config);
            return {status: "success", response: "Reset linked messages for " + name};
        }catch(err){
            return {status: "error", response: err.message};
        }
    }
}


class Attach extends Reactionroles{
    constructor(){
        super();
        this.name = "attach";
        this.aliases = [];
        this.id = this.name;
    }

    async execute(ctx: ICommandContext<rrM>, Hyperion: IHyperion): CommandResponse{
        const name = ctx.args[1];
        if(!name){return {status: "error", response: "Please give a name for the reaction role to attach"};}
        const config = await ctx.module.getConfig(ctx.guild.id);
        const rr = config.rr.get(name);
        if(!rr){return {status: "error", response: "Couldnt find that reaction role"};}
        if(rr.linkedMessages.length > 0){return {status: "neutral", response: "That reaction role has already been posted"};}
        const channelOrLink = ctx.args[2];
        const linkTest = Hyperion.utils.parseMessageLink(channelOrLink);
        let channel, message: undefined | Message;
        if(linkTest){
            if(linkTest.guild !== ctx.guild.id){return {status: "error", response: "That link isnt even for this server!"};}
            channel = ctx.guild.channels.get(linkTest.channel);
            if(!channel){return {status: "neutral", response: "I couldnt find that channel in the server"};}
            if(!(channel.type === 0 || channel.type === 5)){return {status: "error", response: "Please link me to a text or announcement channel"};}
            message = (channel as GuildTextableChannel).messages.get(linkTest.message) ?? await (channel as GuildTextableChannel).getMessage(linkTest.message).catch(() => undefined);
            if(!message){return {status: "neutral", response: "I couldnt find that message in that channel"};}
        }else{
            const temp = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, channelOrLink);
            if(!temp){return {status: "neutral", response: "Could not find that channel in the server"};}
            channel = temp;
            message = channel.messages.get(ctx.args[3]) ?? await channel.getMessage(ctx.args[3]).catch(() => undefined);
            if(!message){return {status: "neutral", response: "Could not find that message in that channel"};}
        }
        if(!ctx.module.checkAddPerms(channel as GuildTextableChannel)){return {status: "error", response: "I dont have permissions to read message history and/or add reactions in that channel"};}
        try{
            const result = await ctx.module.addReactions([...rr.erMap.keys()], message);
            if(result.failed.length === 0){
                config.rrMessages.set(message.id, name);
                rr.linkedMessages.push(message.id);
                config.rr.set(name, rr);
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "reactionroles", config);
                return {status: "fancySuccess", response: "Successfully posted reaction role!"};
            }else{
                return {status: "error", response: `Couldnt add reaction ${result.failed[0]}, for the reason: ${result.reason}`};
            }
        }catch(err){
            return {status: "error", response: "Something went wrong, " + err.message};
        }
    }
}


const subarr = [List, Create, Delete, Add, Remove, Show, Post, Reset, Attach];
export default Reactionroles;
export {subarr as subcmd};