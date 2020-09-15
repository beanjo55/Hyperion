import { Guild, Message, User } from "eris";
import {Module} from "../../Core/Structures/Module";
import { IHyperion, levelUpdateResult } from "../../types";
import {randomInt} from "mathjs";
import {LevelsConfig} from "../../Core/Managers/MongoGuildManager";
import { IUser } from "../../MongoDB/User";
import { IGuildUser } from "../../MongoDB/Guilduser";

class Levels extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "levels",
            friendlyName: "Levels",
            hasCommands: true,
            hasCfg: false,
            dirname: __dirname,
            defaultStatus: false,
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
    }

    async messageCreate(Hyperion: IHyperion, msg: Message): Promise<void | undefined>{
        if(msg.author.bot){return;}
        if(!(msg.channel.type === 5 || msg.channel.type === 0)){return;}
        const onCooldown = await this.Hyperion.redis.get(`LevelCooldown:${msg.author.id}`);
        if(onCooldown !== null){return;}
        const inc = this.getExpInc();
        await this.updateGlobalExp(msg.author, msg.channel.guild, msg, inc);
        const enabled = await this.checkGuildEnabled(msg.channel.guild.id);
        if(!enabled){return;}
        await this.updateGuildExp(msg.author, msg.channel.guild, msg, inc);
    }

    async setCooldown(userID: string): Promise<void>{
        const acks = await this.Hyperion.managers.user.getAcks(userID);
        await this.Hyperion.redis.set(`LevelCooldown:${userID}`, "1", "EX", (acks.pro ? this.Hyperion.global.exp.cooldown/2 : this.Hyperion.global.exp.cooldown));
    }

    getLevel(exp: number): number{
        const exc = this.Hyperion.global.exp;
        return Math.floor(exc.coeff*(Math.sqrt((exp+exc.offset)/exc.div)));
    }

    getExpInc(){
        const exc = this.Hyperion.global.exp;
        return randomInt(exc.min, exc.max);
    }

    async updateGlobalExp(user: User, guild: Guild, msg: Message, exp: number): Promise<void>{
        const result = await this.Hyperion.managers.user.addExp(user.id, exp, this.getLevel.bind(this));
        await this.setCooldown(user.id);
        if(result.lvlUp === true){
            await this.levelUp(guild, msg, result, true);
        }
        await this.expRoles(guild, msg, result.data, true);
    }

    async updateGuildExp(user: User, guild: Guild, msg: Message, exp: number): Promise<void>{
        const result = await this.Hyperion.managers.guildUser.addExp(user.id, guild.id, exp, this.getLevel.bind(this));
        await this.setCooldown(user.id);
        if(result.lvlUp === true){
            await this.levelUp(guild, msg, result);
        }
        await this.expRoles(guild, msg, result.data);
    }

    async getLevelsConfig(guild: string): Promise<LevelsConfig>{
        return await this.Hyperion.managers.guild.getModuleConfig<LevelsConfig>(guild, this.name);
    }

    async expRoles(guild: Guild, msg: Message, data: IUser | IGuildUser, global = false): Promise<void>{
        const config = await this.getLevelsConfig(guild.id);
        if(global){
            for(const prop of Object.keys(config.expRoles)){
                const numProp = Number(prop);
                if(config.expRoles[numProp].global && config.expRoles[numProp].exp <= data.exp){
                    msg.member?.addRole(config.expRoles[numProp].role).catch(() => undefined);
                }
            }
        }else{
            for(const prop of Object.keys(config.expRoles)){
                const numProp = Number(prop);
                if(!config.expRoles[numProp].global && config.expRoles[numProp].exp <= data.exp){
                    msg.member?.addRole(config.expRoles[numProp].role, "Hyperion levels").catch(() => undefined);
                }
            }
        }
    }

    async levelUp(guild: Guild, msg: Message, data: levelUpdateResult, global = false): Promise<void | undefined>{
        const config = await this.getLevelsConfig(guild.id);
        if(config.lvlUpSetting !== "none"){
            if(config.lvlUpSetting === "current"){
                msg.channel.createMessage(`Congrats ${msg.author.mention}, you just reached level ${data.data.level}!`).catch(() => undefined);
            }else{
                const lvlUpChannel = guild.channels.get(config.lvlUpSetting);
                if(lvlUpChannel && (lvlUpChannel.type === 5 || lvlUpChannel.type === 0)){
                    lvlUpChannel.createMessage(`Congrats ${msg.author.mention}, you just reached level ${data.data.level}!`).catch(() => undefined);
                }
            }
        }
        if(!global && config.lvlRoles){
            const role = config.lvlRoles[data.data.level];
            if(role && role.global === false){
                msg.member?.addRole(role.role).catch(() => undefined);
            }
        }
        if(global && config.lvlRoles){
            const role = config.lvlRoles[data.data.level];
            if(role && role.global === true){
                msg.member?.addRole(role.role).catch(() => undefined);
            }
        }
    }
}
export default Levels;