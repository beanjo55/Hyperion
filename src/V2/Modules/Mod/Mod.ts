/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import {Module, ConfigKey} from "../../Structures/Module";
import { IModerationContext, IHyperion} from "../../types";
import { Guild, Member, Collection, User, Message, Role, Embed } from "eris";
import { moderationType, modLogType } from "../../../main";
import { ModConfig} from "../../Structures/MongoGuildManager";



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
const timeends = ["d", "day", "days", "m", "minute", "min",  "h", "hour", "hours", "week", "w"];
class Mod extends Module{
    sweepInterval!: NodeJS.Timeout | undefined;
    actions: {[key: string]: ActionInfo};
    constructor(Hyperion: IHyperion){
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
        }, Hyperion);
        this.configKeys = this.loadKeys();
        this.actions = actionObj;
        this.ready();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async guildMemberAdd(...args: [Guild, Member]): Promise<void>{
        const guild = args[0];
        const member = args[1];
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const active = await this.Hyperion.managers.moderations.raw().find({guild: guild.id, user: member.id}).lean<moderationType>().exec();
        let muterole: Role | string | undefined;
        for(const moderation of active){
            if(moderation.action === "mute"){
                if(!muterole){
                    muterole = await this.checkMuteRole(guild);
                }
                if(typeof(muterole) === "string"){continue;}
                if(member.roles.includes(muterole.id)){continue;}
                try{
                    await member.addRole(muterole.id, "Mute persist");
                // eslint-disable-next-line no-empty
                }catch{}
            }
            if(moderation.action === "persist"){
                for(const role of moderation.roles ?? []){
                    const rrole = guild.roles.get(role!);
                    if(!rrole){continue;}
                    try{
                        await member.addRole(rrole.id, "Hyperion Role Persist");
                        // eslint-disable-next-line no-empty
                    }catch{}
                }
            }
        }
    }

    ready(): void{
        if(this.sweepInterval){return;}
        this.sweepInterval = setInterval(this.sweep.bind(this), 60000);
    }

    hasModeration(action: string): boolean{
        const result = actionObj[action];
        if(!result){throw new Error("Invalid action");}
        return result.hasModeration;
    }

    async isMod(member: Member, guild: Guild, warn = false): Promise<boolean>{
        const config = await this.Hyperion.managers.guild.getModuleConfig<ModConfig>(guild.id, this.name);
        if(warn && !config.protectWarns){return false;}
        if(member.permissions.has("manageGuild")){return true;}
        const roles = await this.Hyperion.managers.guild.getMods(guild.id);
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

    // eslint-disable-next-line complexity
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
        if(input.endsWith("hours")){
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
        if(input.endsWith("days")){
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
        if(input.endsWith("min")){
            input = input.substring(0, input.length-6);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*minute);
        }
        if(input.endsWith("week")){
            input = input.substring(0, input.length-6);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*day*7);
        }
        if(input.endsWith("w")){
            input = input.substring(0, input.length-6);
            const num = Number(input);
            if(isNaN(num)){return 0;}
            return Math.abs(num*day*7);
        }
        //should be unreachable but ts angery
        return 0;
    }

    async banDM(user: User, guildName: string, reason: string): Promise<void>{
        user.getDMChannel().then(x => {
            x.createMessage(`You were banned in \`${guildName}\` for: ${reason}`).catch(() => {});
        });
    }

    async kickDM(user: User, guildName: string, reason: string): Promise<void>{
        user.getDMChannel().then(x => {
            x.createMessage(`You were kicked in \`${guildName}\` for: ${reason}`).catch(() => {});
        });
    }

    async muteDM(user: User, guildName: string, reason: string, time?: string): Promise<void>{
        const message = time ? `You were muted in \`${guildName}\` for ${reason}. The mute is ${time}` : `You were muted in \`${guildName}\` for: ${reason}`;
        user.getDMChannel().then(x => x.createMessage(message).catch(() => {}));
    }

    async canModerate(member: Member, botMember: Member, guild: Guild): Promise<boolean>{
        const targetRoles = this.Hyperion.utils.sortRoles(member.roles ?? [], guild.roles);
        const botRoles = this.Hyperion.utils.sortRoles(botMember.roles ?? [], guild.roles);
        if(member.id === guild.ownerID){return false;}
        if(botRoles.length === 0){return false;}
        if(botRoles.length !== 0 && targetRoles.length === 0){return true;}
        if(botRoles[0].position <= targetRoles[0].position){return false;}
        return true;
    }

    async isProtected(member: Member, guild: Guild, warn = false): Promise<boolean>{
        const modConfig = await this.Hyperion.managers.guild.getModuleConfig<ModConfig>(guild.id, this.name);
        if(warn && !modConfig.protectWarns){return false;}
        if(modConfig.protectedRoles.some(r => member.roles.includes(r))){return true;}
        return false;
    }

    //might not need this
    encodeReason(input: string): string{
        if(input === decodeURI(input)){
            return encodeURIComponent(input);
        }
        return input;
    }



    async makeLog(ctx: IModerationContext, user: User): Promise<void>{
        ctx.caseNumber = await this.getNextCase(ctx.guild.id);
        await this.incCaseNum(ctx.guild.id);
        ctx.mid = this.genMID(ctx.guild.id, ctx.caseNumber!);
        await this.Hyperion.managers.modlog.newCase(ctx);
        const log = await this.getLogChannel(ctx.guild.id);
        if(log){
            const channel = ctx.guild.channels.get(log);
            if(channel && channel.type === 0){
                try{
                    
                    await channel.createMessage(this.makeEmbed(ctx, user)).then((X: Message) => {
                        this.Hyperion.managers.modlog.addMessageID(ctx.mid!, X.id, channel.id);
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
            timestamp: new Date(ctx.timeGiven),
            title: `${this.actions[ctx.moderationType].friendlyName} | Case ${ctx.caseNumber} | ${user.username}#${user.discriminator}`,
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
        if(ctx.length !== undefined && ctx.length !== 0){
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

        if(ctx.moderator === "253233185800847361" && ctx.moderationType === "ban"){
            data.embed.title = `${"Bean" as string} | Case ${ctx.caseNumber!} | ${user.username}#${user.discriminator}`;
        }
        if(ctx.moderator === "253233185800847361" && ctx.moderationType === "unban"){
            data.embed.title = `${"UnBean" as string} | Case ${ctx.caseNumber!} | ${user.username}#${user.discriminator}`;
        }
        return data;
    }

    addCaseTag(input: string, caseNum: number): string {return `${input}, Case ${caseNum}`;}

    async incCaseNum(guild: string): Promise<void>{
        const oldConf = await this.Hyperion.managers.guild.getConfig(guild);
        if(!oldConf){throw new Error("Failed to get old mod data, can not continue saving case");}
        if(!oldConf.mod){(oldConf.mod as Partial<ModConfig>) = {lastCase: 0};}
        const newCase = (oldConf.mod as ModConfig).lastCase +1;
        await this.Hyperion.managers.guild.updateModuleConfig(guild, this.name, {lastCase: newCase});
    }

    async getNextCase(guild: string): Promise<number>{
        const data = await this.Hyperion.managers.guild.getConfig(guild);
        if(!data?.mod){return 1;}
        if((data.mod as ModConfig).lastCase === 0){return 1;}
        if(!data.mod.lastCase){return 1;}
        return (data.mod as ModConfig).lastCase+1;
    }

    async getLogChannel(guild: string): Promise<string | undefined>{
        const config = await this.Hyperion.managers.guild.getConfig(guild);
        if(!(config?.mod as ModConfig)?.modLogChannel){return;}
        return (config!.mod as ModConfig).modLogChannel;
    }

    async checkMuteRole(guild: Guild): Promise<Role | string>{
        const data = await this.Hyperion.managers.guild.getConfig(guild.id);
        data.mod = new ModConfig(data.mod ?? {});
        const id = (data?.mod as ModConfig)?.muteRole;
        if(!id){
            if(data?.mod?.manageMuteRole ?? true){
                const newRole = await this.makeMuteRole(guild);
                await this.Hyperion.managers.guild.updateModuleConfig(guild.id, this.name, {muteRole: newRole.id});
                return newRole;
            }else{return "No mute role set!";}
        }
        const role = guild.roles.get(id);
        if(!role){
            if(data?.mod?.manageMuteRole ?? true){
                const newRole = await this.makeMuteRole(guild);
                await this.Hyperion.managers.guild.updateModuleConfig(guild.id, this.name, {muteRole: newRole.id});
                return newRole;
            }else{return "The set mute role was invalid, please set it again";}
        }
        if(data?.mod?.manageMuteRole ?? true){await this.updateMuteRole(guild, role.id);}
        return role;
    }

    async canManageRole(guild: Guild, role: Role, bot: Member): Promise<boolean>{
        const botRoles = this.Hyperion.utils.sortRoles(bot.roles ?? [], guild.roles);
        if(botRoles.length === 0){return false;}
        if(botRoles[0].position <= role.position){return false;}
        return true;
    }

    async updateModerationTime(mid: string, newTime: number, stringLength: string): Promise<void>{
        const log = await this.Hyperion.managers.modlog.getCaseByMID(mid);
        if(!log){throw new Error("could not find old log");}
        const newEnd = log.timeGiven + newTime;
        await this.Hyperion.managers.moderations.raw().updateOne({mid: mid}, {duration: newTime, end: newEnd, untimed: false});
        await this.Hyperion.managers.modlog.updateModerationTime(mid, newTime, stringLength);
        if(log.logPost){
            const ctx = await this.logToContext(log);
            ctx.length = newTime;
            ctx.stringLength = stringLength;
            const user = this.Hyperion.client.users.get(ctx.user) ?? await this.Hyperion.client.getRESTUser(ctx.user).catch(() => undefined);
            if(!user){throw new Error("Could not find user from old log");}
            const embed = this.makeEmbed(ctx, user);
            const channel = log.logChannel ?? await this.getLogChannel(log.guild);
            if(!channel){return;}
            const channelObj = this.Hyperion.client.guilds.get(log.guild)?.channels.get(channel);
            if(!channelObj){return;}
            if(!(channelObj.type === 5 || channelObj.type === 0)){return;}
            const message = await channelObj.getMessage(log.logPost).catch(() => undefined);
            if(!message){return;}
            message.edit(embed);
        }
    }

    async addModeration(ctx: IModerationContext): Promise<void>{
        const data: moderationType = {
            mid: ctx.mid!,
            user: ctx.user,
            caseNum: ctx.caseNumber!,
            action: ctx.moderationType  as "ban" | "persist" | "lock" | "mute",
            start: ctx.timeGiven,
            duration: ctx.length!,
            end: ctx.timeGiven + ctx.length!,
            untimed: false,
            guild: ctx.guild.id
        };
        if(ctx.role){
            data.roles = [ctx.role];
        }
        if(ctx.removedRoles){
            data.roles = ctx.removedRoles;
        }
        await this.Hyperion.managers.moderations.raw().create(data);
    }

    async removeModerationTime(mid: string): Promise<void>{
        await this.Hyperion.managers.moderations.raw().updateOne({mid: mid}, {duration: 0, end: 0, untimed: true});
        await this.Hyperion.managers.modlog.removeModerationTime(mid);
        const log = await this.Hyperion.managers.modlog.getCaseByMID(mid);
        if(!log){throw new Error("could not find old log");}
        if(log.logPost){
            const ctx = await this.logToContext(log);
            ctx.length = 0;
            ctx.stringLength = undefined;
            const user = this.Hyperion.client.users.get(ctx.user) ?? await this.Hyperion.client.getRESTUser(ctx.user).catch(() => undefined);
            if(!user){throw new Error("Could not find user from old log");}
            const embed = this.makeEmbed(ctx, user);
            const channel = log.logChannel ?? await this.getLogChannel(log.guild);
            if(!channel){return;}
            const channelObj = this.Hyperion.client.guilds.get(log.guild)?.channels.get(channel);
            if(!channelObj){return;}
            if(!(channelObj.type === 5 || channelObj.type === 0)){return;}
            const message = await channelObj.getMessage(log.logPost).catch(() => undefined);
            if(!message){return;}
            message.edit(embed);
        }
    }

    async addUntimedModeration(ctx: IModerationContext): Promise<void>{
        const data: moderationType = {
            mid: ctx.mid!,
            user: ctx.user,
            caseNum: ctx.caseNumber!,
            action: ctx.moderationType as "ban" | "persist" | "lock" | "mute",
            start: ctx.timeGiven,
            duration: 0,
            end: 0,
            untimed: true,
            guild: ctx.guild.id
        };
        if(ctx.role){
            data.roles = [ctx.role];
        }
        if(ctx.removedRoles){
            data.roles = ctx.removedRoles;
        }
        await this.Hyperion.managers.moderations.raw().create(data);
    }

    async logToContext(log: modLogType): Promise<IModerationContext>{
        const data: IModerationContext = {
            user: log.user,
            caseNumber: log.caseNumber,
            mid: log.mid,
            moderationType: log.moderationType,
            moderator: log.moderator,
            auto: log.auto,
            timeGiven: log.timeGiven,
            guild: this.Hyperion.client.guilds.get(log.guild)!,
            reason: log.reason,
            autoEnd: log.autoEnd,
            logChannel: log.logChannel ?? await this.getLogChannel(log.guild)
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
        this.Hyperion.managers.moderations.raw().deleteMany({guild: guild, user: user, action: "mute"}).exec();
    }

    async sweep(): Promise<void>{
        const moderations = await this.Hyperion.managers.moderations.raw().find({end: {$lte: Date.now()}, untimed: false}).lean<moderationType>().exec();
        for(const moderation of moderations){
            const log = await this.Hyperion.managers.modlog.getCaseByMID(moderation.mid);
            if(!log){
                this.Hyperion.logger.warn("Hyperion", `${moderation.mid} had a moderation set to expire, but no associated log`, "Moderation Sweep");
                if((moderation.failCount ?? 0) < 3){
                    this.Hyperion.managers.moderations.raw().updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                }else{
                    this.Hyperion.managers.moderations.raw().deleteOne({mid: moderation.mid}).exec();
                }
                continue;
            }
            const mod = this.Hyperion.client.users.get(log.moderator) ?? await this.Hyperion.client.getRESTUser(log.moderator).catch(() => {});
            const guild = this.Hyperion.client.guilds.get(log.guild);
            
            if(!guild){
                this.Hyperion.logger.warn("Hyperion", `Could not find guild to end moderation ${moderation.mid}`, "Moderation Sweep");
                if((moderation.failCount ?? 0) < 3){
                    this.Hyperion.managers.moderations.raw().updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                }else{
                    this.Hyperion.managers.moderations.raw().deleteOne({mid: moderation.mid}).exec();
                }
                continue;
            }
            if((await this.checkGuildEnabled(guild.id)) === false){continue;}
            const ctx: IModerationContext = {
                mid: moderation.mid,
                user: moderation.user,
                moderator: (mod as User).id,
                moderationType: log.moderationType,
                timeGiven: log.timeGiven,
                auto: log.auto,
                guild: guild,
                caseNumber: log.caseNumber,
                moderationEnd: false,
                autoEnd: false
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
            this.processModeration(ctx).then(r => {
                if(r){
                    this.Hyperion.managers.moderations.raw().deleteOne({mid: moderation.mid}).exec();
                    this.Hyperion.managers.modlog.markExpired(moderation.mid);
                }else{
                    if((moderation.failCount ?? 0) >= 3){
                        this.Hyperion.managers.moderations.raw().deleteOne({mid: moderation.mid}).exec();
                    }else{
                        this.Hyperion.managers.moderations.raw().updateOne({mid: moderation.mid}, {$inc: {failCount: 1}}).exec();
                    }
                }
            });
        }
        
    }

    async processModeration(ctx: IModerationContext): Promise<boolean>{
        if(ctx.moderationType === "mute"){return this,this.autoUnmute(ctx);}
        return false;
    }

    async autoUnmute(ctx: IModerationContext): Promise<boolean>{
        const user = ctx.guild.members.get(ctx.user) ?? await ctx.guild.getRESTMember(ctx.user).catch(() => {});
        if(!user){
            //asuming user isnt in the server, just silently remove the moderation
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const channel = await this.getLogChannel(ctx.guild.id);
        const role = await this.checkMuteRole(ctx.guild);
        if(typeof(role) === "string"){return false;}
        try{
            await user.removeRole(role.id, "Auto unmute");
        }catch(err){
            this.Hyperion.logger.warn("Hyperion", `Error occured during auto unmute, guild ${ctx.guild.id}, mid ${ctx.mid}, error ${err}`, "Moderation Sweep");
            return false;
        }
        const caseNum = await this.getNextCase(ctx.guild.id);
        await this.incCaseNum(ctx.guild.id);
        const mid = this.genMID(ctx.guild.id, caseNum);
        const newctx: IModerationContext = {
            user: ctx.user,
            moderator: this.Hyperion.client.user.id,
            moderationType: "unmute",
            auto: true,
            guild: ctx.guild,
            timeGiven: Date.now(),
            moderationEnd: true,
            reason: "Auto Unmute",
            caseNumber: caseNum,
            mid: mid,
            autoEnd: true
        };
        await this.Hyperion.managers.modlog.markExpired(ctx.mid!);
        await this.Hyperion.managers.modlog.newCase(newctx);
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
                        value: `Auto Unmute for Case ${ctx.caseNumber}`,
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
                this.Hyperion.managers.modlog.addMessageID(mid, x.id, channelobj.id);
            }).catch(err => this.Hyperion.logger.warn("Hyperion", `Failed to post auto unmute log, error: ${err}`, "Moderation Sweep"));
        }
        return true;
    }

    async makeMuteRole(guild: Guild): Promise<Role>{
        const role = await guild.createRole({name: "Muted", permissions: 0}, "Hyperion manage mute role");
        await this.updateMuteRole(guild, role.id);
        return role;
    }

    async updateMuteRole(guild: Guild, roleID: string): Promise<void> {
        const channels = guild.channels.filter(c => c.type === 0 || c.type === 5 || c.type === 2);
        for(const channel of channels){
            const channelPerms = channel.permissionOverwrites.get(roleID);
            if(channelPerms && (channelPerms.deny & (1 << 11)) === (1 << 11)){continue;}
            await channel.editPermission(roleID, 0, (1 << 11), "role", "Hyperion manage mute role").catch(() => this.Hyperion.logger.error("e", "overwrites"));
        }
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
        col.add(new ConfigKey({
            parent: this.name,
            id: "deleteAfterUse",
            ops: [0, 1, 4],
            description: "If mod commands should be deleted after they are successfully used",
            friendlyName: "Delete After Use",
            dataType: "boolean",
            array: false,
            default: false
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "manageMuteRole",
            ops: [0, 1, 4],
            description: "If Hyperion should create the muted role if it doesnt exist, and update the channel overrides for the muted role when a user is muted",
            friendlyName: "Manage mute role",
            dataType: "boolean",
            array: false,
            default: true
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "dmOnBan",
            ops: [0, 1, 4],
            description: "If the user should be messaged when they are banned (if they are in the server)",
            friendlyName: "Dm on ban",
            dataType: "boolean",
            array: false,
            default: false
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "dmOnKick",
            ops: [0, 1, 4],
            description: "If the user should be messaged when they are kicked or softbanned (if they are in the server)",
            friendlyName: "Dm on kick",
            dataType: "boolean",
            array: false,
            default: false
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "dmOnMute",
            ops: [0, 1, 4],
            description: "If the user should be messaged when they are muted",
            friendlyName: "Dm on mute",
            dataType: "boolean",
            array: false,
            default: false
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "protectedRoles",
            ops: [0, 2, 3, 4],
            description: "Roles that are protected from moderator actions",
            friendlyName: "Protected Roles",
            dataType: "role",
            array: true,
            default: []
        }));
        col.add(new ConfigKey({
            parent: this.name,
            id: "protectWarns",
            ops: [0, 1, 4],
            description: "If protected roles or mods should be immune to warns",
            friendlyName: "Protect Warns",
            dataType: "boolean",
            array: false,
            default: false
        }));
        return col;
    }
}
export default Mod;
