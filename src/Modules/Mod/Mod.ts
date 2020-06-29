/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import {Module, ConfigKey} from "../../Core/Structures/Module";
import { IModerationContext, ModConfig } from "../../types";
import HyperionC from "../../main";
import { Guild, Member, Collection, User, Message, Role, Embed } from "eris";
import {IModeration, default as ModerationModel} from "../../MongoDB/Moderation";
import { IModLog, IModLogDoc } from "../../MongoDB/Modlog";

const day = 86400000;
const minute = 60000;
const colors = {red: 15541248, yellow: 16771072, green: 65386, orange: 15234850, blue: 30719};
interface ActionInfo {friendlyName: string; color: number; hasModeration: boolean}
const actionObj: {[key: string]: ActionInfo} = {
    ban: {
        friendlyName: "Ban",
        color: colors.red,
        hasModeration: false
    },
    kick: {
        friendlyName: "Kick",
        color: colors.red,
        hasModeration: false
    },
    softban: {
        friendlyName: "Softban",
        color: colors.red,
        hasModeration: false
    },
    mute: {
        friendlyName: "Mute",
        color: colors.orange,
        hasModeration: true
    },
    unban: {
        friendlyName: "Unban",
        color: colors.green,
        hasModeration: false
    },
    unmute: {
        friendlyName: "Unmute",
        color: colors.green,
        hasModeration: false
    },
    warn: {
        friendlyName: "Warn",
        color: colors.yellow,
        hasModeration: false
    },
    rolepersist: {
        friendlyName: "Role Persist",
        color: colors.blue,
        hasModeration: false
    },
    delwarn: {
        friendlyName: "Warn Delete",
        color: colors.blue,
        hasModeration: false
    },
    delwarnall: {
        friendlyName: "Warns Cleared",
        color: colors.blue,
        hasModeration: false
    }
};
const timeends = ["d", "day", "m", "minute", "h", "hour"];
class Mod extends Module{
    sweepInterval!: NodeJS.Timeout | undefined;
    actions: {[key: string]: ActionInfo};
    constructor(){
        super({
            name: "mod",
            friendlyName: "Mod",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: true,
            dirname: __dirname,
            subscribedEvents: ["guildMemberAdd", "ready"],
            defaultStatus: true
        });
        this.configKeys = this.loadKeys();
        this.actions = actionObj;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async guildMemberAdd(Hyperion: HyperionC, guild: Guild, member: Member): Promise<void>{
        if(!await this.checkGuildEnabled(Hyperion, guild.id)){return;}
        const active = await ModerationModel.find({guild: guild.id, user: member.id}).lean<IModeration>().exec();
        let muterole: Role | string | undefined;
        for(const moderation of active){
            if(moderation.action === "mute"){
                if(!muterole){
                    muterole = await this.checkMuteRole(Hyperion, guild);
                }
                if(typeof(muterole) === "string"){continue;}
                if(member.roles.includes(muterole.id)){continue;}
                try{
                    await member.addRole(muterole.id, "Mute persist");
                // eslint-disable-next-line no-empty
                }catch{}
            }
            if(moderation.action === "rolepersist"){
                const role = guild.roles.get(moderation.role!);
                if(!role){continue;}
                try{
                    await member.addRole(role.id, "Hyperion Role Persist");
                // eslint-disable-next-line no-empty
                }catch{}
            }
        }
    }

    async ready(Hyperion: HyperionC): Promise<void>{
        if(this.sweepInterval){return;}
        this.sweepInterval = setInterval(this.sweepManager.bind(Hyperion), 60000);
    }

    async isMod(Hyperion: HyperionC, member: Member, guild: Guild): Promise<boolean>{
        if(member.permission.has("manageGuild")){return true;}
        const roles = await Hyperion.managers.guild.getMods(guild.id);
        if(member.roles.some((r: string) => roles.indexOf(r) >= 0)){return true;}
        return false;
    }

    genMID(guildId: string, caseID: number): string{
        return `${guildId}:${caseID}`;
    }

    guildFromMID(mid: string): string{
        return mid.split(":")[0];
    }

    caseFromMID(mid: string): string{
        return mid.split(":")[1];
    }

    parseTime(input: string): number{
        input = input.toLowerCase();
        if(!(timeends.some(end => input.endsWith(end)))){return 0;}
        if(input.endsWith("m")){
            input = input.substring(0, input.length-1);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*minute);
        }
        if(input.endsWith("d")){
            input = input.substring(0, input.length-1);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*day);
        }
        if(input.endsWith("h")){
            input = input.substring(0, input.length-1);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*minute*60);
        }
        if(input.endsWith("hour")){
            input = input.substring(0, input.length-4);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*minute*60);
        }
        if(input.endsWith("day")){
            input = input.substring(0, input.length-3);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*day);
        }
        if(input.endsWith("minute")){
            input = input.substring(0, input.length-6);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*minute);
        }
        //should be unreachable but ts angery
        return 0;
    }

    async banDM(user: User, guildName: string, reason: string): Promise<void>{
        user.getDMChannel().then(x => {
            x.createMessage(`You were banned in \`${guildName}\` for: ${reason}`).catch(() => {});
        });
    }

    async muteDM(user: User, guildName: string, reason: string, time?: string): Promise<void>{
        const message = time ? `You were muted in \`${guildName}\` for ${reason}. The mute is ${time}` : `You were muted in \`${guildName}\` for: ${reason}`;
        user.getDMChannel().then(x => x.createMessage(message).catch(() => {}));
    }

    async canModerate(Hyperion: HyperionC, member: Member, botMember: Member, guild: Guild): Promise<boolean>{
        const targetRoles = Hyperion.utils.sortRoles(member.roles, guild.roles);
        const botRoles = Hyperion.utils.sortRoles(botMember.roles, guild.roles);
        if(member.id === guild.ownerID){return false;}
        if(botRoles.length === 0){return false;}
        if(botRoles.length !== 0 && targetRoles.length === 0){return true;}
        if(botRoles[0].position <= targetRoles[0].position){return false;}
        return true;
    }

    //might not need this
    encodeReason(input: string): string{
        if(input === decodeURI(input)){
            return encodeURIComponent(input);
        }
        return input;
    }

    async makeLog(Hyperion: HyperionC, ctx: IModerationContext, user: User): Promise<void>{

        ctx.case = await this.getNextCase(Hyperion, ctx.guild.id);
        await this.incCaseNum(Hyperion, ctx.guild.id);
        ctx.mid = this.genMID(ctx.guild.id, ctx.case!);
        await Hyperion.managers.modlog.newCase(ctx);
        const log = await this.getLogChannel(Hyperion, ctx.guild.id);
        if(log){
            const channel = ctx.guild.channels.get(log);
            if(channel && channel.type === 0){
                try{
                    
                    await channel.createMessage(this.makeEmbed(ctx, user)).then((X: Message) => {
                        Hyperion.managers.modlog.addMessageID(ctx.mid!, X.id);
                    });
                    
                // eslint-disable-next-line no-empty
                }catch{}
            }
        }
        if(actionObj[ctx.moderationType].hasModeration){
            if(ctx.length !== undefined && ctx.length !== 0){
                this.addModeration(ctx);
            }else{
                this.addUntimedModeration(ctx);
            }
        }
    }

    makeEmbed(ctx: IModerationContext, user: User): {embed: Partial<Embed>}{
        const data = {embed: {
            color: this.actions[ctx.moderationType].color,
            footer: {
                text: `User ID: ${ctx.user} | MID: ${ctx.mid}`
            },
            timestamp: new Date(ctx.time),
            title: `${this.actions[ctx.moderationType].friendlyName} | Case ${ctx.case} | ${user.username}#${user.discriminator}`,
            fields: [
                {
                    name: "User",
                    value: `${user.mention}\n(${user.id})`,
                    inline: true
                },
                {
                    name: "Moderator",
                    value: `<@${ctx.moderator}>\n(${ctx.moderator})`,
                    inline: true
                }
            ]
        }};
        if(ctx.length){
            data.embed.fields.push({
                name: "Length",
                value: ctx.stringLength!,
                inline: true
            });
        }
        data.embed.fields.push({
            name: "Reason",
            value: `${ctx.reason !== "" ? ctx.reason : "No reason given"}`,
            inline: false
        });
        return data;
    }

    addCaseTag(input: string, caseNum: number): string {return `${input}, Case ${caseNum}`;}

    async incCaseNum(Hyperion: HyperionC, guild: string): Promise<void>{
        const oldConf = await Hyperion.managers.guild.getConfig(guild);
        if(!oldConf){throw new Error("Failed to get old mod data, can not continue saving case");}
        if(!oldConf.mod){(oldConf.mod as Partial<ModConfig>) = {lastCase: 0};}
        const newCase = (oldConf.mod as ModConfig).lastCase +1;
        await Hyperion.managers.guild.updateModuleConfig(guild, "mod", {lastCase: newCase});
    }

    async getNextCase(Hyperion: HyperionC, guild: string): Promise<number>{
        const data = await Hyperion.managers.guild.getConfig(guild);
        if(!data?.mod){return 1;}
        if((data.mod as ModConfig).lastCase === 0){return 1;}
        return (data.mod as ModConfig).lastCase+1;
    }

    async getLogChannel(Hyperion: HyperionC, guild: string): Promise<string | undefined>{
        const config = await Hyperion.managers.guild.getConfig(guild);
        if(!(config?.mod as ModConfig)?.modLogChannel){return;}
        return (config!.mod as ModConfig).modLogChannel;
    }

    async checkMuteRole(Hyperion: HyperionC, guild: Guild): Promise<Role | string>{
        const data = await Hyperion.managers.guild.getConfig(guild.id);
        const id = (data?.mod as ModConfig)?.muteRole;
        if(!id){return "No mute role set!";}
        const role = guild.roles.get(id);
        if(!role){return "The set mute role was invalid, please set it again";}
        return role;
    }

    async canManageRole(Hyperion: HyperionC, guild: Guild, role: Role, bot: Member): Promise<boolean>{
        const botRoles = Hyperion.utils.sortRoles(bot.roles, guild.roles);
        if(botRoles.length === 0){return false;}
        if(botRoles[0].position <= role.position){return false;}
        return true;
    }

    async addModeration(ctx: IModerationContext): Promise<void>{
        const data: IModeration = {
            mid: ctx.mid!,
            user: ctx.user,
            caseNum: ctx.case!,
            action: ctx.moderationType,
            start: ctx.time,
            duration: ctx.length!,
            end: ctx.time + ctx.length!,
            untimed: false,
            guild: ctx.guild.id
        };
        if(ctx.role){
            data.role = ctx.role;
        }
        if(ctx.removedRoles){
            data.roles = ctx.removedRoles;
        }
        await ModerationModel.create(data);
    }

    async addUntimedModeration(ctx: IModerationContext): Promise<void>{
        const data: IModeration = {
            mid: ctx.mid!,
            user: ctx.user,
            caseNum: ctx.case!,
            action: ctx.moderationType,
            start: ctx.time,
            duration: 0,
            end: 0,
            untimed: true,
            guild: ctx.guild.id
        };
        if(ctx.role){
            data.role = ctx.role;
        }
        if(ctx.removedRoles){
            data.roles = ctx.removedRoles;
        }
        await ModerationModel.create(data);
    }

    logToContext(log: IModLog | IModLogDoc, Hyperion: HyperionC): IModerationContext{
        const data: IModerationContext = {
            user: log.user,
            case: log.caseNumber,
            mid: log.mid,
            moderationType: log.moderationType,
            moderator: log.moderator,
            auto: log.auto,
            time: log.timeGiven,
            guild: Hyperion.client.guilds.get(log.guild)!,
            reason: log.reason
        };
        if(log.stringLength){
            data.stringLength = log.stringLength;
        }
        if(log.duration){
            data.length = log.duration;
        }
        if(log.role){
            data.role = log.role;
        }
        if(log.removedRoles){
            data.removedRoles = log.removedRoles;
        }
        return data;
    }

    async removeActiveMutes(guild: string, user: string): Promise<void>{
        ModerationModel.deleteMany({guild: guild, user: user, action: "mute"}).exec();
    }

    async sweepManager(this: HyperionC): Promise<void>{
        const mod = this.modules.get("mod");
        if(!mod){
            this.logger.fatal("Hyperion", "Moderation module was not found!", "Moderation Sweep");
            return;
        }
        mod.sweep(this);
    }

    async sweep(Hyperion: HyperionC): Promise<void>{
        const moderations = await ModerationModel.find({end: {$lte: Date.now()}, untimed: false}).lean<IModeration>().exec();
        for(const moderation of moderations){
            const log = await Hyperion.managers.modlog.getCaseByMID(moderation.mid);
            if(!log){
                Hyperion.logger.warn("Hyperion", `${moderation.mid} had a moderation set to expire, but no associated log`, "Moderation Sweep");
                if((moderation.failCount ?? 0) < 3){
                    ModerationModel.updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                }else{
                    ModerationModel.deleteOne({mid: moderation.mid}).exec();
                }
                continue;
            }
            const mod = Hyperion.client.users.get(log.moderator) ?? await Hyperion.client.getRESTUser(log.moderator).catch(() => {});
            const guild = Hyperion.client.guilds.get(log.guild);
            
            if(!guild){
                Hyperion.logger.warn("Hyperion", `Could not find guild to end moderation ${moderation.mid}`, "Moderation Sweep");
                if((moderation.failCount ?? 0) < 3){
                    ModerationModel.updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                }else{
                    ModerationModel.deleteOne({mid: moderation.mid}).exec();
                }
                continue;
            }
            if((await this.checkGuildEnabled(Hyperion, guild.id)) === false){continue;}
            const ctx: IModerationContext = {
                mid: moderation.mid,
                user: moderation.user,
                moderator: (mod as User).id,
                moderationType: log.moderationType,
                time: log.timeGiven,
                auto: log.auto,
                guild: guild,
                case: log.caseNumber,
                moderationEnd: false
            };
            if(log.reason){
                ctx.reason = log.reason;
            }
            if(log.duration && log.stringLength){
                ctx.length = log.duration;
                ctx.stringLength = log.stringLength;
            }
            if(log.removedRoles){
                ctx.removedRoles = log.removedRoles;
            }
            if(log.role){
                ctx.role = log.role;
            }
            this.processModeration(Hyperion, ctx).then(r => {
                if(r){
                    ModerationModel.deleteOne({mid: moderation.mid}).exec();
                    Hyperion.managers.modlog.markExpired(moderation.mid);
                }else{
                    if((moderation.failCount ?? 0) >= 3){
                        ModerationModel.deleteOne({mid: moderation.mid}).exec();
                    }else{
                        ModerationModel.updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                    }
                }
            });
        }
        
    }

    async processModeration(Hyperion: HyperionC, ctx: IModerationContext): Promise<boolean>{
        if(ctx.moderationType === "mute"){return this,this.autoUnmute(Hyperion, ctx);}
        return false;
    }

    async autoUnmute(Hyperion: HyperionC, ctx: IModerationContext): Promise<boolean>{
        const user = ctx.guild.members.get(ctx.user) ?? await ctx.guild.getRESTMember(ctx.user).catch(() => {});
        if(!user){
            //asuming user isnt in the server, just silently remove the moderation
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const channel = await this.getLogChannel(Hyperion, ctx.guild.id);
        const role = await this.checkMuteRole(Hyperion, ctx.guild);
        if(typeof(role) === "string"){return false;}
        try{
            await user.removeRole(role.id, "Auto unmute");
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Error occured during auto unmute, guild ${ctx.guild.id}, mid ${ctx.mid}, error ${err}`, "Moderation Sweep");
            return false;
        }
        const caseNum = await this.getNextCase(Hyperion, ctx.guild.id);
        await this.incCaseNum(Hyperion, ctx.guild.id);
        const mid = this.genMID(ctx.guild.id, caseNum);
        const newctx: IModerationContext = {
            user: ctx.user,
            moderator: Hyperion.client.user.id,
            moderationType: "unmute",
            auto: true,
            guild: ctx.guild,
            time: Date.now(),
            moderationEnd: true,
            reason: "Auto Unmute",
            case: caseNum,
            mid: mid
        };
        await Hyperion.managers.modlog.newCase(newctx);
        if(channel){
            const channelobj = ctx.guild.channels.get(channel);
            if(!channelobj || channelobj.type !== 0){return true;}
            const data = {embed: {
                color: this.actions["unmute"].color,
                footer: {
                    text: `User ID: ${ctx.user} | MID: ${mid}`
                },
                timestamp: new Date,
                title: `${this.actions["unmute"].friendlyName} | Case ${caseNum} | ${user.username}#${user.discriminator}`,
                fields: [
                    {
                        name: "User",
                        value: `${user.mention}\n(${user.id})`,
                        inline: true
                    },
                    {
                        name: "Original Moderator",
                        value: `<@${ctx.moderator}>\n(${ctx.moderator})`,
                        inline: true
                    },
                    {
                        name: "Reason",
                        value: `Auto Unmute for Case ${ctx.case}`,
                        inline: true
                    },
                    {
                        name: "Original Reason",
                        value: `${ctx.reason}`,
                        inline: false
                    }
                ]
            }};
            channelobj.createMessage(data).then((x: Message) => {
                Hyperion.managers.modlog.addMessageID(mid, x.id);
            }).catch(err => Hyperion.logger.warn("Hyperion", `Failed to post auto unmute log, error: ${err}`, "Moderation Sweep"));
        }
        return true;
    }

    loadKeys(): Collection<ConfigKey>{
        const col = new Collection(ConfigKey);
        col.add(new ConfigKey({
            parent: this.name,
            id: "modLogChannel",
            ops: [0, 1, 4],
            description: "The channel that moderation logs will be posted to",
            friendlyName: "Mod Log Channel",
            dataType: "channel",
            array: false,
            default: ""
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "muteRole",
            ops: [0, 1, 4],
            description: "The role that is assigned when someone is muted",
            friendlyName: "Mute Role",
            dataType: "role",
            array: false,
            default: ""
        }));    
        return col;
    }
}
export default Mod;
