/* eslint-disable @typescript-eslint/no-empty-function */
import {Module} from "../../Structures/Module";
import {Message, Member, Embed, GuildChannel, MessageContent} from "eris";
import {inspect} from "util";
import {Command} from "../../Structures/Command";
import {Scope} from "@sentry/node";
import * as Types from "../../types";
import { GuildType } from "../../../main";
import { ack } from "../../../Structures/Utils";

enum HandlerType{
    normal = 0,
    admin,
    dev
}


enum HandlerLogLevel{
    error = 0,
    warning,
    info,
    debug
}

interface IHandlerConfig{
    type: HandlerType;
    ghost: boolean;
    logLevel: HandlerLogLevel;
}

interface Isolated{
    type: "dev" | "admin" | "normal";
    label: string;
    args: Array<string>;
}

function createMessage(this: Types.ICommandContext, input: MessageContent){
    this.channel.createMessage(input);
}

class CommandHandler extends Module{
    type: HandlerType;
    ghost: boolean;
    logLevel: HandlerLogLevel;
    constructor(Hyperion: Types.IHyperion, data: IHandlerConfig){
        super({
            name: "commandhandler",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname,
            subscribedEvents: ["messageCreate"]
        }, Hyperion);
        this.type = data?.type ?? 0;
        this.ghost = data?.ghost ?? false;
        this.logLevel = data?.logLevel ?? 0;
    }

    async messageCreate(...args: [Message]): Promise<void>{
        this.handler(args[0]);
    }
    /** 
    init(Hyperion: Types.IHyperion): void{
        Hyperion.handler = this;
    }*/

    handlerLogLevel(): HandlerLogLevel{
        return this.logLevel;
    }

    handlerType(): HandlerType{
        return this.type;
    }

    handlerGhostMode(): boolean{
        return this.ghost;
    }

    setLogLevel(level: number): void{
        this.logLevel = level;
    }

    setGhost(mode: boolean): void{
        this.ghost = mode;
    }

    async getConfig(guildID: string): Promise<GuildType | null>{
        return await this.Hyperion.managers.guild.getConfig(guildID);
    }

    isMod(user: Member, guildConfig: GuildType): boolean{
        if(user.permissions.has("manageGuild")){return true;}
        if(!guildConfig.mod){return false;}
        if(!guildConfig.mod.modRoles){return false;}
        if(guildConfig.mod.modRoles.length === 0){return false;}
        for(const role of guildConfig.mod.modRoles){
            if(user.roles.includes(role)){return true;}
        }
        return false;
    }

    ackToBit(acks: Types.AckInterface): number{
        let bit = 0;
        if(acks.developer){bit = bit | (1 << 2);}
        if(acks.admin){bit = bit | (1 << 3);}
        if(acks.owner){bit = bit | (1 << 1);}
        if(acks.staff){bit = bit | (1 << 4);}
        if(acks.support){bit = bit | (1 << 5);}
        if(acks.friend){bit = bit | (1 << 6);}
        if(acks.pro){bit = bit | (1 << 7);}
        if(acks.contrib){bit = bit | (1 << 8);}
        return bit;
    }

    bitToAck(bit: number): Types.AckInterface{
        return {
            owner: (bit & (1 << 1)) ? true : false,
            developer: (bit & (1 << 2)) ? true : false,
            admin: (bit & (1 << 3)) ? true : false,
            staff: (bit & (1 << 4)) ? true : false,
            support: (bit & (1 << 5)) ? true : false,
            friend: (bit & (1 << 6)) ? true : false,
            pro: (bit & (1 << 7)) ? true : false,
            contrib: (bit & (1 << 8)) ? true : false

        };
    }

    async getAcks(user: string){
        const out = await this.Hyperion.redis.get(`Acks:${user}`);
        if(!out){return 0;}
        return out;
    }

    async setAcks(user: string, acks: number){
        await this.Hyperion.redis.set(`Acks:${user}`, acks);
    }

    isManager(user: Member): boolean{
        if(user.permissions.has("manageGuild")){return true;}
        return false;
    }

    async isSupport(user: string): Promise<boolean>{
        const acks: ack = await this.Hyperion.managers.user.getAcks(user);
        return acks.support;
    }

    async isAdmin(user: string): Promise<boolean>{
        const acks: ack = await this.Hyperion.managers.user.getAcks(user);
        if(!acks.admin){
            if(acks.dev){return true;}
        }else{
            return acks.admin;
        }
        return acks.admin;
    }

    async isDev(user: string): Promise<boolean>{
        const acks: ack = await this.Hyperion.managers.user.getAcks(user);
        return acks.dev;
    }

    async isFriend(user: string): Promise<boolean>{
        const acks: ack = await this.Hyperion.managers.user.getAcks(user);
        return acks.friend;
    }

    async isContrib(user: string): Promise<boolean>{
        const acks: ack = await this.Hyperion.managers.user.getAcks(user);
        return acks.contrib;
    }

    async isolate(msg: Message, guildConfig: GuildType): Promise<Isolated | null>{
        if(msg.content.startsWith(this.Hyperion.devPrefix) && await this.isDev(msg.author.id)){
            return {
                type: "dev",
                label: msg.content.split(" ").slice(0, 1)[0].slice(this.Hyperion.devPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(msg.content.startsWith(this.Hyperion.devPrefix) && msg.author.id === "325087287539138560"){
            return {
                type: "normal",
                label: msg.content.split(" ").slice(0, 1)[0].slice(this.Hyperion.devPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(msg.content.startsWith(this.Hyperion.adminPrefix) && await this.isAdmin(msg.author.id) ){
            return {
                type: "admin",
                label: msg.content.split(" ").slice(0, 1)[0].slice(this.Hyperion.adminPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(msg.content.startsWith(guildConfig.prefix)){
            return {
                type: "normal",
                label: msg.content.split(" ").slice(0, 1)[0].slice(guildConfig.prefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }
        
        if(guildConfig.casualPrefix && msg.content.toLowerCase().startsWith(this.Hyperion.client.user.username.toLowerCase())){
            if(!msg.content.split(" ").slice(1, 2)[0]){return null;}
            return {
                type: "normal",
                label: msg.content.split(" ").slice(1, 2)[0].trim().toLowerCase(),
                args: msg.content.split(" ").slice(2)
            };
        }

        if(msg.content.replace("<@!", "<@").startsWith(this.Hyperion.client.user.mention)){
            if(!msg.content.split(" ").slice(1, 2)[0]){return null;}
            return {
                type: "normal",
                label: msg.content.split(" ").slice(1, 2)[0].trim().toLowerCase(),
                args: msg.content.split(" ").slice(2)
            };
        }
        
        return null;
    }

    findCommand(commandLabel: string): Command | undefined{
        let found: Command | undefined = this.Hyperion.commands.get(commandLabel.toLowerCase());
        if(!found){
            found = this.Hyperion.commands.find((c: Command) => c.aliases.includes(commandLabel.toLowerCase()));
        }
        return found;
    }

    findSubcommand(subLabel: string, parent: Command): Command | undefined{
        let sub: Command | undefined = parent.subcommands!.get(subLabel.toLowerCase());
        if(!sub){
            sub = parent.subcommands!.find((c: Command) => c.aliases.includes(subLabel.toLowerCase()));
        }
        return sub;
    }

    global(command: Command, module: Module, user: string): boolean{
        if(this.Hyperion.global.disabledCommands.includes(command.name)){return false;}
        if(this.Hyperion.global.disabledModules.includes(module.name)){return false;}
        if(this.Hyperion.global.userBlacklist.includes(user)){return false;}
        return true;
    }

    guildCommandEnabled(guildConfig: GuildType, command: Command): boolean{
        if(!guildConfig.commands){return true;}
        if(!guildConfig.commands[command.name]){return true;}
        if(command.alwaysEnabled){return true;}
        if(guildConfig.commands[command.name].enabled !== undefined){return guildConfig.commands[command.name].enabled;}
        return true;
    }

    guildModuleEnabled(config: GuildType, module: Module): boolean{
        if(module.alwaysEnabled){return true;}
        if(!config.modules){return module.defaultStatus;}
        if(config.modules[module.name] === undefined){
            return module.defaultStatus;
        }else {
            if(typeof config.modules[module.name] === "object"){
                if((config.modules[module.name] as {enabled: boolean}).enabled !== undefined){return (config.modules[module.name] as {enabled: boolean}).enabled;}
                return module.defaultStatus;
            }else{
                return config.modules[module.name] as boolean;
            }
        }
    }

    ignored(guildConfig: GuildType, user: Member, channel: string): boolean{
        if(guildConfig.ignoredRoles !== undefined){
            for(const role of guildConfig.ignoredRoles){
                if(user.roles.includes(role)){return true;}
            }
        }

        if(guildConfig.ignoredChannels !== undefined){
            if(guildConfig.ignoredChannels.includes(channel)){return true;}
        }

        if(guildConfig.ignoredUsers !== undefined){
            if(guildConfig.ignoredUsers.includes(user.id)){return true;}
        }

        return false;
    }

    allowedRoles(guildConfig: GuildType, roles: Array<string>, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].allowedRoles){return null;}
        if(guildConfig.commands[command].allowedRoles.length === 0){return null;}
        if(guildConfig.commands[command].allowedRoles.some(r => roles.includes(r))){return true;}
        return false;
    }

    disabledRoles(guildConfig: GuildType, roles: Array<string>, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].disabledRoles){return null;}
        if(guildConfig.commands[command].disabledRoles.length === 0){return null;}
        if(guildConfig.commands[command].disabledRoles.some(r => roles.includes(r))){return true;}
        return false;
    }

    allowedChannel(guildConfig: GuildType, channel: GuildChannel, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].allowedChannels){return null;}
        if(guildConfig.commands[command].allowedChannels.length === 0){return null;}
        if(guildConfig.commands[command].allowedChannels.includes(channel.id) || (channel.parentID && guildConfig.commands[command].allowedChannels.includes(channel.parentID!))){return true;}
        return false;
    }

    disabledChannel(guildConfig: GuildType, channel: GuildChannel, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].disabledChannels){return null;}
        if(guildConfig.commands[command].disabledChannels.length === 0){return null;}
        if(guildConfig.commands[command].disabledChannels.includes(channel.id) || (channel.parentID && guildConfig.commands[command].disabledChannels.includes(channel.parentID!))){return true;}
        return false;
    }

    // eslint-disable-next-line complexity
    authorized(guildConfig: GuildType, ctx: Partial<Types.ICommandContext>): boolean{
        if(!ctx?.member?.roles){return false;}
        if(!ctx?.command){return false;}
        if(!ctx?.channel){return false;}
        const results: Array<boolean | null> = [
            this.allowedRoles(guildConfig, ctx.member.roles, ctx.command.name),
            this.disabledRoles(guildConfig, ctx.member.roles, ctx.command.name),
            this.allowedChannel(guildConfig, ctx.channel, ctx.command.name),
            this.disabledChannel(guildConfig, ctx.channel, ctx.command.name)
        ];

        if(!(this.isMod(ctx.member, guildConfig) || this.isManager(ctx.member))){
            if(results[0] !== null && !results[0]){return false;}
            if(results[2] !== null && !results[2]){return false;}
            if(results[0] !== null && results[0]){return true;}
            if(results[2] !== null && results[2]){return true;}
            if(results[1] !== null && results[1]){return false;}
            if(results[3] !== null && results[3]){return false;}
        }

        if(!this.isManager(ctx.member) && this.isMod(ctx.member, guildConfig)){
            if(results[1] !== null && results[1]){return false;}
            if(results[0] !== null && results[0]){return true;}
            if(results[2] !== null && results[2]){return true;}
        }
        if(this.ignored(guildConfig, ctx.member, ctx.channel.id)){
            if(!(this.isManager(ctx.member) || this.isMod(ctx.member, guildConfig))){return false;}
        }
        if(ctx.command.userperms.includes("manager") && !this.isManager(ctx.member)){return false;}
        if(ctx.command.userperms.includes("mod") && !this.isMod(ctx.member, guildConfig)){return false;}
        return true;
    }

    async specialAuthorized(user: string, command: Command): Promise<boolean>{
        if(command.dev){
            if(await this.isDev(user)){
                return true;
            }else{
                return false;
            }
        }

        if(command.admin){
            if(await this.isAdmin(user)){
                return true;
            }
            else{
                return false;
            }
        }

        if(command.support){
            if(await this.isAdmin(user) || await this.isSupport(user) || await this.isDev(user)){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }

    async updateRedisCooldown(user: string, command: Command, globalTime: number): Promise<void>{
        await this.Hyperion.redis.set(`Cooldown:${user}:Global`, 1, "EX", 1).catch(e => this.Hyperion.logger.error("Ass", "ass"));
        await this.Hyperion.redis.set(`Cooldown:${user}:${command.name}`, 1, "EX", command.cooldownTime/1000);
    }

    async checkRedisCooldown(user: string, command: Command): Promise<boolean>{
        if(await this.Hyperion.redis.get(`Cooldown:${user}:Global`) !== null){return false;}
        if(await this.Hyperion.redis.get(`Cooldown:${user}:${command.name}`) !== null){return false;}
        return true;
    }

    async executeCommand(ctx: Types.ICommandContext): Promise<undefined | void>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.command.execute(ctx, this.Hyperion).then(async (result: any) => {
            await this.commandSuccess(ctx, result);
            return;
        }).catch((err: Error) => {
            if(this.logLevel >= 2 && err.toString().startsWith("Discord")){
                this.Hyperion.logger.warn("Hyperion", "API Error", `Command failed with discord error: ${inspect(err)}`);
            }
            this.Hyperion.logger.error("Hyperion", `Error executing ${ctx.command.name}, Command Call: ${ctx.msg.content}\nerror: ${err}`, "Command Error");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.Hyperion.sentry.configureScope(function(scope: Scope){
                scope.setExtra("Command String", ctx.msg.content);
                scope.setExtra("Guild", ctx.guild.id);
            });
            this.Hyperion.sentry.captureException(err);
            return this.commandError(ctx, err);
        });

        
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async commandError(ctx: Types.ICommandContext, result: any): Promise<void>{
        try{
            await ctx.channel.createMessage(result);
        }catch(err){
            if(!inspect(err).startsWith("Discord")){
                ctx.channel.createMessage("An Error Occured").catch(() => {});
            }
        }
        this.updateRedisCooldown(ctx.user.id, ctx.command, this.Hyperion.global.globalCooldown);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async commandSuccess(ctx: Types.ICommandContext, result: string | {embed: Partial<Embed>} | Types.emoteResponse): Promise<void | undefined>{
        this.updateRedisCooldown(ctx.user.id, ctx.command, this.Hyperion.global.globalCooldown);
        this.updateCommandStats(ctx.command);
        if(ctx.command.selfResponse){return;}
        let out: Types.EmbedResponse | string;
        if((result as Types.emoteResponse)?.status !== undefined){
            out = this.Hyperion.emotes[(result as Types.emoteResponse).status] + " " + (result as Types.emoteResponse).response;
        }else{
            out = result as Types.EmbedResponse | string;
        }
        try{
            await ctx.channel.createMessage(out);
        }catch(err){
            if(!inspect(err).startsWith("Discord")){
                ctx.channel.createMessage("An Error Occured").catch(() => {});
            }
        }
        
    }

    async updateCommandStats(command: Command): Promise<void>{
        this.Hyperion.redis.incr("lcr");
        if(command.parentName){
            this.Hyperion.redis.incr(`CommandStats:${command.parentName}:${command.name}`);
        }else{
            this.Hyperion.redis.incr(`CommandStats:${command.name}`);
        }
    }

    sendHelp(ctx: Partial<Types.ICommandContext>): string | Types.EmbedResponse | undefined{
        if(this.ghost && !ctx.admin){return;}
        if(!ctx?.user){return;}
        if(this.Hyperion.global.userBlacklist.includes(ctx.user.id)){return;}
        if(ctx.guildConfig!.ignoredChannels.includes(ctx.channel!.id) && !this.isMod(ctx.member!, ctx.guildConfig!)){return;}
        if(ctx.args && ctx.args[0]){
            if(ctx.args[0] === "253233185800847361" || ctx.args[0] === "<@253233185800847361>" || ctx.args[0] === "<@!253233185800847361>"){
                return "If you're reading this, you've been in a coma for almost 20 years now. We're trying a new technique. We don't know where this message will end up in your dream, but we hope it works. Please wake up, we miss you.";
            }
            const cmd = this.findCommand(ctx.args[0]);
            if(cmd){
                return this.sendCommandHelp(ctx, cmd);
            }
        }
        const cats = this.Hyperion.modules.filter(mod => !mod.private && mod.hasCommands);
        const fieldarr: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                title: "Hyperion Help",
                color: this.Hyperion.colors.default,
                timestamp: new Date(),
                fields: fieldarr,
                description: "[Invite me here](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&scope=bot&permissions=2110123134)\n[Join the support server here](https://discord.gg/Vd8vmBD)\n[Read the docs here](https://docs.hyperionbot.xyz)"
            }
        };
        for(const cat of cats){
            const cmds = this.Hyperion.commands.filter(c => !c.unlisted && (c.listUnder.toLowerCase() === cat.name.toLowerCase())).map(c => c.name).join(", ");
            if(cmds.length === 0){continue;}
            const toPush: {name: string; value: string; inline: boolean} = {
                name: cat.friendlyName,
                value: cmds,
                inline: false
            };
            data.embed.fields.push(toPush);
        }
        this.updateRedisCooldown(ctx.user.id, ({name: "help", cooldownTime: 1000} as Command), this.Hyperion.global.globalCooldown);
        return data;
    }
    
    sendCommandHelp(ctx: Partial<Types.ICommandContext>, cmd: Command): {embed: Partial<Embed>} | undefined{
        if(!cmd){return;}
        if(!ctx?.guildConfig?.prefix){return;}
        if(!ctx?.user?.id){return;}
        const rx = new RegExp("{prefix}", "gmi");
        let info = `**Description:** ${cmd.helpDetail}\n**Cooldown:** ${cmd.cooldownTime/1000} seconds`;
        if(cmd.aliases.length !== 0){
            info += `\n**Aliases:** ${cmd.aliases.join(", ")}`;
        }
        if(cmd.userperms.length !== 0){
            if(cmd.userperms.includes("manager")){info += "\n**Permission Level:** Manager";}
            if(cmd.userperms.includes("mod")){info += "\n**Permission Level:** Moderator";}
        }
        if(cmd.hasSub && !cmd.noSubList){
            info += `\n**Subcommands:**\n${cmd.helpSubcommands.replace(rx, ctx.guildConfig.prefix)}`;
        }
        info += `\n**Usage:**\n${cmd.helpUsage.replace(rx, ctx.guildConfig.prefix)}`;
        if(!cmd.noExample){
            info += `\n**Examples:**\n${cmd.helpUsageExample.replace(rx, ctx.guildConfig.prefix)}`;
        }
        const data = {
            embed: {
                title: `Help for ${ctx.guildConfig.prefix}${cmd.name}`,
                color: this.Hyperion.colors.default,
                timestamp: new Date(),
                description: info
            }
        };
        this.updateRedisCooldown(ctx.user.id, ({name: "help", cooldownTime: 1000} as Command), this.Hyperion.global.globalCooldown);
        return data;
    }
    // eslint-disable-next-line complexity
    async handler(msg: Message): Promise<undefined | void>{
        if(this.Hyperion.global === undefined){return;}
        if(!msg){return;}
        if(!msg.member){return;}
        if(!msg.channel){return;}
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author.bot){return;}
        const conf = await this.getConfig(msg.channel.guild.id);
        if(!conf){return;}
        const ctx: Partial<Types.ICommandContext> = {
            msg: msg,
            channel: msg.channel,
            guild: msg.channel.guild,
            guildConfig: conf,
            member: msg.member,
            user: msg.author,
            content: msg.content,
            dev: false,
            admin: false
        };

        const isolated: Isolated | null = await this.isolate(msg, ctx.guildConfig!);
        if(!isolated){return;}
        if(isolated.type === "dev"){
            ctx.dev = true;
            ctx.admin = true;
        }else{
            if(isolated.type === "admin"){
                ctx.admin = true;
            }
        }

        ctx.args = isolated.args;
        if(isolated.label.toLowerCase() === "diagnose"){
            if(!(this.isMod(ctx.member!, ctx.guildConfig!) || ctx.admin)){return;}
            if(!ctx.args[0]){
                msg.channel.createMessage("Please specify a command or module to diagnose.").catch(() => undefined);
                return;
            }
            let forceType = 0;
            if(ctx.args[1] && ctx.args[1].toLowerCase() === "-command"){forceType = 1;}
            if(ctx.args[1] && ctx.args[1].toLowerCase() === "-module"){forceType = 2;}
            let toDiagnose: Command | Module | undefined = undefined;
            if(forceType === 0){
                toDiagnose = this.findCommand(ctx.args[0]) ?? this.Hyperion.modules.get(ctx.args[0].toLowerCase());
                if(!toDiagnose){
                    msg.channel.createMessage("I couldnt find a command or module by that name.").catch(() => undefined);
                    return;
                }
            }
            if(forceType === 1){
                toDiagnose = this.findCommand(ctx.args[0]);
                if(!toDiagnose){
                    msg.channel.createMessage("I couldnt find a command by that name.").catch(() => undefined);
                    return;
                }
            }
            if(forceType === 2){
                toDiagnose = this.Hyperion.modules.get(ctx.args[0].toLowerCase());
                if(!toDiagnose || toDiagnose.name === "highlights"){
                    msg.channel.createMessage("I couldnt find a module by that name.").catch(() => undefined);
                    return;
                }
            }
            if(toDiagnose instanceof Command){
                const result = await (toDiagnose as Command).diagnose(this.Hyperion, ctx.guild!);
                if(!result){
                    msg.channel.createMessage("I couldnt find a command or module by that name.").catch(() => undefined);
                    return;
                }
                result.embed.title = result.embed.title?.replace("{prefix}", ctx.guildConfig!.prefix ?? "%");
                msg.channel.createMessage(result).catch(() => undefined);
                return;
            }
            if(toDiagnose instanceof Module){
                const result = await (toDiagnose as Module).diagnose(ctx.guild!);
                if(!result){
                    msg.channel.createMessage("I couldnt find a command or module by that name.").catch(() => undefined);
                    return;
                }
                msg.channel.createMessage(result).catch(() => undefined);
                return;
            }
            msg.channel.createMessage("I couldnt find a command or module by that name.").catch(() => undefined);
            return ;
        }
        if(isolated.label.toLowerCase() === "help"){
            //if(!await this.checkRedisCooldown(ctx.user!.id, ({name: "help"} as Command))){return;}
            //const out = this.sendHelp(ctx);
            //if(!out){return;}
            //this.updateRedisCooldown(ctx.user!.id, ({name: "help", cooldownTime: 1000} as Command), this.Hyperion.global.globalCooldown);
            //await ctx.channel!.createMessage(out).catch(() => {});
            return;
        }
        const command: Command | undefined = this.findCommand(isolated.label);
        if(!command){return;}
        ctx.command = command;
        if(command.hasSub && ctx.args[0]){
            const sub = this.findSubcommand(ctx.args[0], ctx.command);
            if(sub !== undefined){
                ctx.command = sub;
            }
        }
        ctx.module = this.Hyperion.modules.get(ctx.command.module);
        const module = ctx.module!;
        if(!ctx.admin && !this.global(ctx.command, ctx.module!, ctx.user!.id)){return;}
        if(!ctx.admin && !this.guildModuleEnabled(ctx.guildConfig!, ctx.module!)){return;}
        if(!ctx.admin && !this.guildCommandEnabled(ctx.guildConfig!, ctx.command)){return;}
        if(ctx.command.dev || ctx.command.admin || ctx.command.support){
            if(!await this.specialAuthorized(ctx.user!.id, ctx.command)){return;}
        }
        if(!ctx.admin && !this.authorized(ctx.guildConfig!, ctx)){return;}
        if(!ctx.admin && !await this.checkRedisCooldown(ctx.user!.id, ctx.command)){return;}
        const newCtx: Types.ICommandContext<typeof module> = {
            msg: ctx.msg!,
            channel: ctx.channel!,
            guild: ctx.guild!,
            guildConfig: this.Hyperion.managers.guild.fillConfig(ctx.guildConfig!),
            member: ctx.member!,
            user: ctx.user!,
            content: ctx.content!,
            dev: ctx.dev!,
            admin: ctx.admin!,
            command: ctx.command!,
            module: ctx.module!,
            args: ctx.args!,
            createMessage,
            mod: this.isMod(ctx.member!, ctx.guildConfig!)
        };
        newCtx.createMessage = newCtx.createMessage.bind(newCtx);
        if(!ctx.admin && (ctx.command.contrib && !await this.isContrib(ctx.user!.id))){return;}
        if(!ctx.admin && (ctx.command.friend && !await this.isFriend(ctx.user!.id))){return;}
        if(this.ghost && !ctx.admin){return;}
        if(ctx.args[0]?.toLowerCase() === "help"){
            //const out = this.sendCommandHelp(ctx, ctx.command);
            //if(!out){return;}
            //msg.channel.createMessage(out).catch(() => {});
            return;
        }
        return await this.executeCommand(newCtx);
    }
}
export default CommandHandler;
