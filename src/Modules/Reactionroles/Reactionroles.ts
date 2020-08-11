import { Emoji, GuildTextableChannel, Message } from "eris";
import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";
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
            subscribedEvents: ["messageReactionAdd", "messageReactionRemove"]
        }, Hyperion);
    }

    async messageReactionAdd(Hyperion: IHyperion, msg: Message, emote: Emoji, user: string): Promise<void>{
        if(!msg.author){msg = await msg.channel.getMessage(msg.id);}
        const channel = msg.channel;
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.Hyperion.managers.guild.getModuleConfig<RRConfig>(guild.id, this.name);
        if(!(config.rr instanceof Map)){config.rr = new Map<string, ReactionRole>(Object.entries(config.rr ?? {}));}
        if(config.rr.size === 0){return;}
        const rr = config.rr.get(msg.id);
        if(!rr){return;}
        if(!(rr.erMap instanceof Map)){rr.erMap = new Map<string, string>(Object.entries(rr.erMap ?? {}));}
        const roleID = rr.erMap.get(emote.name);
        if(!roleID){return;}
        const role = guild.roles.get(roleID);
        if(!role){return;}
        const member = guild.members.get(user) ?? await guild.getRESTMember(user).catch(() => undefined);
        if(!member){return;}
        if(member.bot){return;}
        member.addRole(roleID, "Hyperion Reaction Role").catch(err => this.Hyperion.logger.error("Hyperion", `Failed to add reaction role, err: ${err}`, "Reaction Roles"));
    }

    async messageReactionRemove(Hyperion: IHyperion, msg: Message, emote: Emoji, user: string): Promise<void>{
        if(!msg.author){msg = await msg.channel.getMessage(msg.id);}
        const channel = msg.channel;
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const guild = msg.channel.guild;
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.Hyperion.managers.guild.getModuleConfig<RRConfig>(guild.id, this.name);
        if(!(config.rr instanceof Map)){config.rr = new Map<string, ReactionRole>(Object.entries(config.rr ?? {}));}
        if(config.rr.size === 0){return;}
        const rr = config.rr.get(msg.id);
        if(!rr){return;}
        if(!(rr.erMap instanceof Map)){rr.erMap = new Map<string, string>(Object.entries(rr.erMap ?? {}));}
        const roleID = rr.erMap.get(emote.name);
        if(!roleID){return;}
        const role = guild.roles.get(roleID);
        if(!role){return;}
        const member = guild.members.get(user) ?? await guild.getRESTMember(user).catch(() => undefined);
        if(!member){return;}
        if(member.bot){return;}
        member.removeRole(roleID, "Hyperion Reaction Role").catch(err => this.Hyperion.logger.error("Hyperion", `Failed to add reaction role, err: ${err}`, "Reaction Roles"));
    }

    async addReactions(emotes: Array<string>, msg: Message): Promise<{failed: Array<string>; reason?: string}>{
        for(const emote of emotes){
            try{
                await msg.addReaction(emote);
            }catch(err){
                if(err.code === 30010){
                    const temp = emotes.indexOf(emote);
                    const failed = emotes.slice(temp);
                    return {failed: failed, reason : "Max number of reactions reached"};
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
}
export default Reactionroles;