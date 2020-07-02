/* eslint-disable @typescript-eslint/no-empty-function */
import {Module} from "../../Core/Structures/Module";
import * as Types from "../../types";
import {Message, Member, Embed, GuildChannel} from "eris";
import {inspect} from "util";
import {Command} from "../../Core/Structures/Command";
import { IGuild } from "../../MongoDB/Guild";
import {Scope} from "@sentry/node";

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

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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

class CommandHandler extends Module{
    type: HandlerType;
    ghost: boolean;
    logLevel: HandlerLogLevel;
    constructor(data: IHandlerConfig){
        super({
            name: "Commandandler",
            private: true,
            alwaysEnabled: true,
            hasCommands: false,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname,
            subscribedEvents: ["messageCreate"]
        });
        this.type = data?.type ?? 0;
        this.ghost = data?.ghost ?? false;
        this.logLevel = data?.logLevel ?? 0;
    }

    async messageCreate(Hyperion: Types.IHyperion, msg: Message): Promise<void>{
        this.handler(msg, Hyperion);
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

    async getConfig(Hyperion: Types.IHyperion, guildID: string): Promise<IGuild | null>{
        return await Hyperion.managers.guild.getConfig(guildID);
    }

    isMod(user: Member, guildConfig: IGuild): boolean{
        if(user.permission.has("manageGuild")){return true;}
        if(!guildConfig.mod){return false;}
        if(!guildConfig.mod.modRoles){return false;}
        if(guildConfig.mod.modRoles.length === 0){return false;}
        for(const role in guildConfig.mod.modRoles){
            if(user.roles.includes(role)){return true;}
        }
        return false;
    }

    isManager(user: Member): boolean{
        if(user.permission.has("manageGuild")){return true;}
        return false;
    }

    async isSupport(user: string, Hyperion: Types.IHyperion): Promise<boolean>{
        const acks: Types.AckInterface = await Hyperion.managers.user.getAcks(user);
        return acks.support;
    }

    async isAdmin(user: string, Hyperion: Types.IHyperion): Promise<boolean>{
        const acks: Types.AckInterface = await Hyperion.managers.user.getAcks(user);
        if(!acks.admin){
            if(acks.developer){return true;}
        }else{
            return acks.admin;
        }
        return acks.admin;
    }

    async isDev(user: string, Hyperion: Types.IHyperion): Promise<boolean>{
        const acks: Types.AckInterface = await Hyperion.managers.user.getAcks(user);
        return acks.developer;
    }

    async isFriend(user: string, Hyperion: Types.IHyperion): Promise<boolean>{
        const acks: Types.AckInterface = await Hyperion.managers.user.getAcks(user);
        return acks.friend;
    }

    async isContrib(user: string, Hyperion: Types.IHyperion): Promise<boolean>{
        const acks: Types.AckInterface = await Hyperion.managers.user.getAcks(user);
        return acks.contrib;
    }

    async isolate(msg: Message, guildPrefix: string, Hyperion: Types.IHyperion): Promise<Isolated | null>{
        if(await this.isDev(msg.author.id, Hyperion) && msg.content.startsWith(Hyperion.devPrefix)){
            return {
                type: "dev",
                label: msg.content.split(" ").slice(0, 1)[0].slice(Hyperion.devPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(await this.isAdmin(msg.author.id, Hyperion) && msg.content.startsWith(Hyperion.adminPrefix)){
            return {
                type: "admin",
                label: msg.content.split(" ").slice(0, 1)[0].slice(Hyperion.adminPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(msg.content.startsWith(guildPrefix)){
            return {
                type: "normal",
                label: msg.content.split(" ").slice(0, 1)[0].slice(guildPrefix.length).trim().toLowerCase(),
                args: msg.content.split(" ").slice(1)
            };
        }

        if(msg.content.replace("<@!", "<@").startsWith(Hyperion.client.user.mention)){
            if(!msg.content.split(" ").slice(1, 2)[0]){return null;}
            return {
                type: "normal",
                label: msg.content.split(" ").slice(1, 2)[0].trim().toLowerCase(),
                args: msg.content.split(" ").slice(2)
            };
        }
        
        return null;
    }

    findCommand(commandLabel: string, Hyperion: Types.IHyperion): Command | undefined{
        let found: Command | undefined = Hyperion.commands.get(commandLabel.toLowerCase());
        if(!found){
            found = Hyperion.commands.find((c: Command) => c.aliases.includes(commandLabel.toLowerCase()));
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

    global(Hyperion: Types.IHyperion, command: Command, module: Module, user: string): boolean{
        if(Hyperion.global.gDisabledCommands.includes(command.name)){return false;}
        if(Hyperion.global.gDisabledMods.includes(module.name)){return false;}
        if(Hyperion.global.blacklist.includes(user)){return false;}
        return true;
    }

    guildCommandEnabled(guildConfig: IGuild, command: Command): boolean{
        if(!guildConfig.commands){return true;}
        if(!guildConfig.commands[command.name]){return true;}
        if(command.alwaysEnabled){return true;}
        if(guildConfig.commands[command.name].enabled !== undefined){return guildConfig.commands[command.name].enabled;}
        return true;
    }

    guildModuleEnabled(guildConfig: IGuild, module: Module): boolean{
        if(!guildConfig.modules){return true;}
        if(!guildConfig.modules[module.name]){return true;}
        if(module.alwaysEnabled){return true;}
        if(guildConfig.modules[module.name].enabled !== undefined){return guildConfig.modules[module.name].enabled;}
        return module.defaultStatus;
    }

    ignored(guildConfig: IGuild, user: Member, channel: string): boolean{
        if(guildConfig.ignoredRoles !== undefined){
            for(const role in guildConfig.ignoredRoles){
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

    allowedRoles(guildConfig: IGuild, roles: Array<string>, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].allowedRoles){return null;}
        if(guildConfig.commands[command].allowedRoles.length === 0){return null;}
        if(guildConfig.commands[command].allowedRoles.some(r => roles.includes(r))){return true;}
        return false;
    }

    disabledRoles(guildConfig: IGuild, roles: Array<string>, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].disabledRoles){return null;}
        if(guildConfig.commands[command].disabledRoles.length === 0){return null;}
        if(guildConfig.commands[command].disabledRoles.some(r => roles.includes(r))){return true;}
        return false;
    }

    allowedChannel(guildConfig: IGuild, channel: GuildChannel, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].allowedChannels){return null;}
        if(guildConfig.commands[command].allowedChannels.length === 0){return null;}
        if(guildConfig.commands[command].allowedChannels.includes(channel.id) ||(channel.parentID && guildConfig.commands[command].allowedChannels.includes(channel.parentID!))){return true;}
        return false;
    }

    disabledChannel(guildConfig: IGuild, channel: GuildChannel, command: string): boolean | null{
        if(!guildConfig){return null;}
        if(!guildConfig.commands){return null;}
        if(!guildConfig.commands[command]){return null;}
        if(!guildConfig.commands[command].disabledChannels){return null;}
        if(guildConfig.commands[command].disabledChannels.length === 0){return null;}
        if(guildConfig.commands[command].disabledChannels.includes(channel.id) ||(channel.parentID && guildConfig.commands[command].disabledChannels.includes(channel.parentID!))){return true;}
        return false;
    }

    authorized(guildConfig: IGuild, ctx: Partial<Types.ICommandContext>): boolean{
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
        }
        if(this.ignored(guildConfig, ctx.member, ctx.channel.id)){
            if(!(this.isManager(ctx.member) || this.isMod(ctx.member, guildConfig))){return false;}
        }
        if(ctx.command.userperms.includes("manager") && !this.isManager(ctx.member)){return false;}
        if(ctx.command.userperms.includes("mod") && !this.isMod(ctx.member, guildConfig)){return false;}
        return true;
    }

    async specialAuthorized(user: string, command: Command, Hyperion: Types.IHyperion): Promise<boolean>{
        if(command.dev){
            if(await this.isDev(user, Hyperion)){
                return true;
            }else{
                return false;
            }
        }

        if(command.admin){
            if(await this.isAdmin(user, Hyperion)){
                return true;
            }
            else{
                return false;
            }
        }

        if(command.support){
            if(await this.isAdmin(user, Hyperion) || await this.isSupport(user, Hyperion)){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }

    async updateRedisCooldown(user: string, command: Command, globalTime: number, Hyperion: Types.IHyperion): Promise<void>{
        await Hyperion.redis.set(`Cooldown:${user}:Global`, 1, "EX", globalTime/1000);
        await Hyperion.redis.set(`Cooldown:${user}:${command.name}`, 1, "EX", command.cooldownTime/1000);
    }

    async checkRedisCooldown(Hyperion: Types.IHyperion, user: string, command: Command): Promise<boolean>{
        if(await Hyperion.redis.get(`Cooldown:${user}:Global`) !== null){return false;}
        if(await Hyperion.redis.get(`Cooldown:${user}:${command.name}`) !== null){return false;}
        return true;
    }

    async executeCommand(ctx: Types.ICommandContext, Hyperion: Types.IHyperion): Promise<undefined | void>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.command.execute(ctx, Hyperion).then(async (result: any) => {
            await this.commandSuccess(ctx, result, Hyperion);
            return;
        }).catch((err: Error) => {
            if(this.logLevel >= 2 && err.toString().startsWith("Discord")){
                Hyperion.logger.warn("Hyperion", "API Error", `Command failed with discord error: ${inspect(err)}`);
            }
            Hyperion.logger.error("Hyperion", `Error executing ${ctx.command.name}, Command Call: ${ctx.msg.content}\nerror: ${err}`, "Command Error");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Hyperion.sentry.configureScope(function(scope: Scope){
                scope.setExtra("Command String", ctx.msg.content);
                scope.setExtra("Guild", ctx.guild.id);
            });
            Hyperion.sentry.captureException(err);
            return this.commandError(ctx, err, Hyperion);
        });

        
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async commandError(ctx: Types.ICommandContext, result: any, Hyperion: Types.IHyperion): Promise<void>{
        try{
            await ctx.channel.createMessage(result);
        }catch(err){
            if(!inspect(err).startsWith("Discord")){
                ctx.channel.createMessage("An Error Occured").catch(() => {});
            }
        }
        this.updateRedisCooldown(ctx.user.id, ctx.command, Hyperion.global.globalCooldown, Hyperion);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async commandSuccess(ctx: Types.ICommandContext, result: any, Hyperion: Types.IHyperion): Promise<void | undefined>{
        this.updateRedisCooldown(ctx.user.id, ctx.command, Hyperion.global.globalCooldown, Hyperion);
        this.updateCommandStats(Hyperion, ctx.command);
        if(ctx.command.selfResponse){return;}

        try{
            await ctx.channel.createMessage(result);
        }catch(err){
            if(!inspect(err).startsWith("Discord")){
                ctx.channel.createMessage("An Error Occured").catch(() => {});
            }
        }
        
    }

    async updateCommandStats(Hyperion: Types.IHyperion, command: Command): Promise<void>{
        Hyperion.redis.incr("lcr");
        Hyperion.redis.incr(`CommandStats:${command.name}`);
    }

    sendHelp(ctx: Partial<Types.ICommandContext>, Hyperion: Types.IHyperion): string | Types.EmbedResponse | undefined{
        if(this.ghost && !ctx.admin){return;}
        if(!ctx?.user){return;}
        if(Hyperion.global.blacklist.includes(ctx.user.id)){return;}
        if(ctx.args && ctx.args[0]){
            if(ctx.args[0] === "253233185800847361" || ctx.args[0] === "<@253233185800847361>" || ctx.args[0] === "<@!253233185800847361>"){
                return "If you're reading this, you've been in a coma for almost 20 years now. We're trying a new technique. We don't know where this message will end up in your dream, but we hope it works. Please wake up, we miss you.";
            }
            const cmd = this.findCommand(ctx.args[0], Hyperion);
            if(cmd){
                return this.sendCommandHelp(ctx, cmd, Hyperion);
            }
        }
        const cats = Hyperion.modules.filter(mod => !mod.private && mod.hasCommands);
        const fieldarr: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                title: "Hyperion Help",
                color: Hyperion.defaultColor,
                timestamp: new Date(),
                fields: fieldarr
            }
        };
        cats.forEach(cat => {
            const cmds = Hyperion.commands.filter(c => !c.unlisted && c.module.toLowerCase() === cat.name.toLowerCase()).map(c => c.name).join(", ");
            const toPush: {name: string; value: string; inline: boolean} = {
                name: cat.friendlyName,
                value: cmds,
                inline: false
            };
            data.embed.fields.push(toPush);
        });
        this.updateRedisCooldown(ctx.user.id, ({name: "help", cooldownTime: 1000} as Command), Hyperion.global.globalCooldown, Hyperion);
        return data;
    }
    
    sendCommandHelp(ctx: Partial<Types.ICommandContext>, cmd: Command, Hyperion: Types.IHyperion): {embed: Partial<Embed>} | undefined{
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
                color: Hyperion.defaultColor,
                timestamp: new Date(),
                description: info
            }
        };
        this.updateRedisCooldown(ctx.user.id, ({name: "help", cooldownTime: 1000} as Command), Hyperion.global.globalCooldown, Hyperion);
        return data;
    }
    async handler(msg: Message, Hyperion: Types.IHyperion): Promise<undefined | void>{
        if(!msg){return;}
        if(!msg.member){return;}
        if(!msg.channel){return;}
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){return;}
        if(msg.author.bot){return;}
        const conf = await this.getConfig(Hyperion, msg.channel.guild.id);
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

        const isolated: Isolated | null = await this.isolate(msg, ctx.guildConfig!.prefix, Hyperion);
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
        if(isolated.label.toLowerCase() === "help"){
            if(!await this.checkRedisCooldown(Hyperion, ctx.user!.id, ({name: "help"} as Command))){return;}
            const out = this.sendHelp(ctx, Hyperion);
            if(!out){return;}
            this.updateRedisCooldown(ctx.user!.id, ({name: "help", cooldownTime: 1000} as Command), Hyperion.global.globalCooldown, Hyperion);
            await ctx.channel!.createMessage(out).catch(() => {});
            return;
        }
        const command: Command | undefined = this.findCommand(isolated.label, Hyperion);
        if(!command){return;}
        ctx.command = command;
        if(command.hasSub && ctx.args[0]){
            const sub = this.findSubcommand(ctx.args[0], ctx.command);
            if(sub !== undefined){
                ctx.command = sub;
            }
        }
        ctx.module = Hyperion.modules.get(ctx.command.module);
        const module = ctx.module!;
        if(!ctx.admin && !this.global(Hyperion, ctx.command, ctx.module!, ctx.user!.id)){return;}
        if(!ctx.admin && !this.guildModuleEnabled(ctx.guildConfig!, ctx.module!)){return;}
        if(!ctx.admin && !this.guildCommandEnabled(ctx.guildConfig!, ctx.command)){return;}
        if(ctx.command.dev || ctx.command.admin || ctx.command.support){
            if(!await this.specialAuthorized(ctx.user!.id, ctx.command, Hyperion)){return;}
        }
        if(!ctx.admin && !this.authorized(ctx.guildConfig!, ctx)){return;}
        if(!ctx.admin && !await this.checkRedisCooldown(Hyperion, ctx.user!.id, ctx.command)){return;}
        const newCtx: Types.ICommandContext<typeof module> = {
            msg: ctx.msg!,
            channel: ctx.channel!,
            guild: ctx.guild!,
            guildConfig: ctx.guildConfig!,
            member: ctx.member!,
            user: ctx.user!,
            content: ctx.content!,
            dev: ctx.dev!,
            admin: ctx.admin!,
            command: ctx.command!,
            module: ctx.module!,
            args: ctx.args!
        };
        if(!ctx.admin && (ctx.command.contrib && !await this.isContrib(ctx.user!.id, Hyperion))){return;}
        if(!ctx.admin && (ctx.command.friend && !await this.isFriend(ctx.user!.id, Hyperion))){return;}
        if(this.ghost && !ctx.admin){return;}
        if(ctx.args[0]?.toLowerCase() === "help"){
            const out = this.sendCommandHelp(ctx, ctx.command, Hyperion);
            if(!out){return;}
            msg.channel.createMessage(out).catch(() => {});
            return;
        }
        return await this.executeCommand(newCtx, Hyperion);
    }
}
export default CommandHandler;