import { Emoji, GuildTextableChannel, Message } from "eris";
import {Module} from "../../Core/Structures/Module";
import { EmbedResponse, IHyperion } from "../../types";
import {RRConfig, ReactionRole} from "../../Core/Managers/MongoGuildManager";

class Reactionroles extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "reactionroles",
            friendlyName: "Reaction Roles",
            private: false,
            alwaysEnabled: false,
            needsInit: false,
            needsLoad: false,
            dirname: __dirname,
            hasCommands: true,
            defaultStatus: true,
            subscribedEvents: ["messageReactionAdd", "messageReactionRemove", "messsageDelete"]
        }, Hyperion);
    }

    async messageDelete(Hyperion: IHyperion, msg: Message | {id: string; channel: GuildTextableChannel}): Promise<void>{
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const guild = msg.channel.guild;
        const enabled = await this.checkGuildEnabled(guild.id);
        if(!enabled){return;}
        const config = await this.getConfig(guild.id);
        if(config.rrMessages.size === 0){return;}
        const name = config.rrMessages.get(msg.id);
        if(!name){return;}
        config.rrMessages.delete(msg.id);
        const rr = config.rr.get(name);
        if(!rr){return;}
        rr.linkedMessages = [];
        config.rr.set(name, rr);
        await Hyperion.managers.guild.updateModuleConfig(guild.id, this.name, config);
    }

    async messageReactionAdd(Hyperion: IHyperion, msg: Message, emote: Emoji, user: string): Promise<void>{
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const guild = msg.channel.guild;
        const enabled = await this.checkGuildEnabled(guild.id);
        if(!enabled){return;}
        const config = await this.getConfig(guild.id);
        if(config.rrMessages.size === 0){return;}
        const rr = config.rrMessages.get(msg.id);
        if(!rr){return;}
        const rrData = config.rr.get(rr);
        if(!rrData){return;}
        const result = this.matchEmote([...rrData.erMap.keys()], emote);
        if(!result){return;}
        const role = rrData.erMap.get(result);
        if(!role){return;}
        const usr = this.Hyperion.client.users.get(user) || await this.Hyperion.client.getRESTUser(user).catch(() => undefined);
        if(usr && usr.bot){return;}
        guild.addMemberRole(user, role, "Hyperion Reaction Role").catch(err => console.warn(`Failed to give RR: ${err.message}`));
    }

    async messageReactionRemove(Hyperion: IHyperion, msg: Message, emote: Emoji, user: string): Promise<void>{
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        const guild = msg.channel.guild;
        const enabled = await this.checkGuildEnabled(guild.id);
        if(!enabled){return;}
        const config = await this.getConfig(guild.id);
        if(config.rrMessages.size === 0){return;}
        const rr = config.rrMessages.get(msg.id);
        if(!rr){return;}
        const rrData = config.rr.get(rr);
        if(!rrData){return;}
        const result = this.matchEmote([...rrData.erMap.keys()], emote);
        if(!result){return;}
        const role = rrData.erMap.get(result);
        if(!role){return;}
        const usr = this.Hyperion.client.users.get(user) || await this.Hyperion.client.getRESTUser(user).catch(() => undefined);
        if(usr && usr.bot){return;}
        guild.removeMemberRole(user, role, "Hyperion Reaction Role").catch(err => console.warn(`Failed to give RR: ${err.message}`));
    }

    matchEmote(emotes: Array<string>, input: {id?: string; name: string}): string | undefined{
        const parsed = emotes.map(em => this.parseEmote(em)).filter(em => em !== undefined);
        for(const em of parsed){
            if(typeof em === "string"){
                if(input.name === em){return em;}
            }else{
                if(input.id && em?.id && em?.id === input?.id && em.name === input.name){return em.full;}
            }
        }
    }

    async addReactions(emotes: Array<string>, msg: Message): Promise<{failed: Array<string>; reason?: string}>{
        emotes = emotes.map(em => {
            return (em.startsWith("<") || em.endsWith(">")) ? em.slice(1, em.length -1) : em;
        });
        for(const emote of emotes){
            try{
                await msg.addReaction(emote);
            }catch(err){
                if(err.code === 30010){
                    const temp = emotes.indexOf(emote);
                    const failed = emotes.slice(temp);
                    return {failed: failed, reason: "Max number of reactions reached"};
                }
                if(err.code === 10014){
                    return {failed: [emote], reason: "Cannot use this emote"};
                }
                return {failed: [emote], reason: err.message};
            }
        }
        return {failed: []};
    }

    checkAddPerms(channel: GuildTextableChannel): boolean{
        if(!channel.permissionsOf(this.Hyperion.client.user.id).has("addReactions")){return false;}
        if(!channel.permissionsOf(this.Hyperion.client.user.id).has("readMessageHistory")){return false;}
        return true;
    }

    async getConfig(guild: string){
        return await this.Hyperion.managers.guild.getModuleConfig<RRConfig>(guild, this.name);
    }

    async createRR(guild: string, name: string){
        const config = await this.getConfig(guild);
        if(config.rr.has(name)){throw new Error("That reaction role already exists!");}
        const isPro = await this.Hyperion.managers.guild.isPro(guild);
        if(config.rr.size >= 3 && !isPro){throw new Error("Maximum number of free reaction roles reached");}
        config.rr.set(name, new ReactionRole({}));
        try{
            await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, config);
        }catch(err){
            throw new Error(err.message);
        }
    }

    async deleteRR(guild: string, name: string){
        const config = await this.getConfig(guild);
        if(!config.rr.has(name)){throw new Error("That reaction role doesnt exist!");}
        config.rr.delete(name);
        try{
            await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, config);
        }catch(err){
            throw new Error(err.message);
        }
    }

    async addRole(guild: string, rrName: string, emote: string, role: string): Promise<void>{
        const config = await this.getConfig(guild);
        const rr = config.rr.get(rrName);
        if(!rr){throw new Error("That reaction role doesnt exist");}
        if(rr.erMap.has(emote)){throw new Error("That emote is already used in this reaction role");}
        if(rr.erMap.size >= 15){throw new Error("Maximum amount of roles reach for this reaction role");}
        const isPro = await this.Hyperion.managers.guild.isPro(guild);
        if(!isPro && rr.erMap.size >= 6 ){throw new Error("Maximum amount of free roles reached.");}
        rr.erMap.set(emote, role);
        config.rr.set(rrName, rr);
        await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, config);
    }

    async delRole(guild: string, rrName: string, emote: string): Promise<void>{
        const config = await this.getConfig(guild);
        const rr = config.rr.get(rrName);
        if(!rr){throw new Error("That reaction role doesnt exist");}
        const toRemove = this.parseEmote(emote) ?? emote;
        if(typeof toRemove === "string"){
            let found = "";
            for(const em of [...rr.erMap.keys()]){
                const temp = this.parseEmote(em);
                if(temp?.name === emote || temp?.id === emote){
                    found = em;
                    break;
                }
            }
            if(found === ""){throw new Error("Could not find that emotes in this reaction role");}
            rr.erMap.delete(found);
            config.rr.set(rrName, rr);
            await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, config);
            return;
        }else{
            if(!rr.erMap.has(toRemove.full)){throw new Error("Could not find that emotes in this reaction role");}
            rr.erMap.delete(toRemove.full);
            config.rr.set(rrName, rr);
            await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, config);
            return;
        }
    }

    isEmote(input: string,): boolean {
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        const result = EmoteRegex.exec(input);
        if(result){return true;}
        return this.Hyperion.utils.hasUnicodeEmote(input);
    }

    parseEmote(input: string): {name: string; id?: string, full: string} | undefined {
        const EmoteRegex = new RegExp(/<(a)?:(\w+):(\d+)>/, "gmi");
        const result = EmoteRegex.exec(input);
        if(result){
            return {name: result[2], id: result[3], full: input};
        }
        if(this.Hyperion.utils.hasUnicodeEmote(input)){return {name: input, full: input};}
    }
}
export default Reactionroles;