import Module from "../../Structures/Module";
import hyperion, {GuildType, CommandContext, CommandResponse} from "../../main";
import {ack} from "../../Structures/Utils";
import { AdvancedMessageContent, EmbedField, Guild, GuildTextableChannel, Member, Message } from "eris";
import Command from "../../Structures/Command";

interface prehandleResult {
    msg: Message;
    channel: GuildTextableChannel;
    guild: Guild;
    member: Member;
    config: GuildType;
    acks: ack;
    content: string
}

interface partialIdentifyResult extends prehandleResult {
    flow: "help" | "diagnose" | "normal";
    args: Array<string>;
}

interface identifyResult<T = Module<unknown>> extends partialIdentifyResult {
    command: Command;
    module: T;
    dev: boolean;
    admin: boolean;
    parent?: Command;
}

function createMessage(this: CommandContext, input: AdvancedMessageContent): Promise<Message> {
    return this.channel.createMessage(input);
}

function delCool(this: Message<GuildTextableChannel>){
    this.delete().catch(() => undefined);
}
export default class CommandHandler extends Module<Record<string, never>> {
    sentCooldowns: {[key: string]: number};
    cooldownInterval!: NodeJS.Timeout;
    constructor(Hyperion: hyperion){
        super({
            name: "commandHandler",
            dir: __dirname,
            path: __dirname + "/CommandHandler.js",
            subscribedEvents: ["messageCreate"],
            alwaysEnabled: true,
            private: true,
            hasCommands: true,
            friendlyName: "Command Handler"
        }, Hyperion);
        this.sentCooldowns = {};
    }

    async messageCreate(...args: [Message]): Promise<void>{
        const msg = args[0];
        const prehandle = await this.prehandle(msg);
        if(!prehandle){return;}
        const identify = await this.identify(prehandle);
        if(!identify){return;}
        if(identify.flow !== "normal"){
            if(identify.flow === "help"){
                this.help(identify);
                return;
            }else{
                const authed = this.diagnoseAuth(identify);
                if(!authed){return;}
                this.diagnose();
                return;
            }
        }
        const enabled = await this.enabled(identify as identifyResult);
        if(!enabled){return;}
        const auth = await this.auth(identify as identifyResult);
        if(!auth){return;}
        this.execute(identify as identifyResult);
    }

    async prehandle(msg: Message): Promise<undefined | prehandleResult> {
        if(msg.author.bot){return;}
        const channel = msg.channel;
        if(!(channel.type === 5 || channel.type === 0)){return;}
        const guild = channel.guild;
        if(this.Hyperion.global.userBlacklist.includes(msg.author.id)){return;}
        if(this.Hyperion.global.guildBlacklist.includes(guild.id)){return;}
        const config = await this.Hyperion.manager.guild(guild.id).getOrCreate();
        const acks = await this.Hyperion.utils.getAcks(msg.author.id);
        if(!msg.member){return;}
        if(!msg.content || msg.content === ""){return;}
        return {
            msg, channel, guild, config, acks, member: msg.member, content: msg.content
        };
    }

    async identify(data: prehandleResult): Promise<undefined | partialIdentifyResult | identifyResult> {
        const isolated = this.isolate(data.content, data.config, data.acks);
        if(!isolated){return;}
        if(isolated.command === "help"){
            const partialData: Partial<partialIdentifyResult> = data;
            partialData.flow = "help";
            partialData.args = isolated.args;
            return partialData as partialIdentifyResult;
        }
        if(isolated.command === "diagnose"){
            const partialData: Partial<partialIdentifyResult> = data;
            partialData.flow = "diagnose";
            partialData.args = isolated.args;
            return partialData as partialIdentifyResult;
        }
        let command = this.findCommand(isolated.command);
        if(!command){return;}
        const newData: Partial<identifyResult> = data;
        
        if(isolated.args.length !== 0 && command.hasSub){
            const sub = this.findSubcommand(command, isolated.args[0]);
            if(sub){
                newData.parent = command;
                command = sub;
            }
        }
        const mod = this.Hyperion.modules.get(command.module);
        if(!mod){return;}
        if(isolated.dev){
            newData.dev = true;
            newData.admin = true;
        }
        if(isolated.admin){newData.admin = true;}
        newData.args = isolated.args;
        newData.command = command;
        newData.module = mod;
        newData.flow = "normal";
        return newData as identifyResult;
    }

    async enabled(data: identifyResult): Promise<boolean> {
        const modEnabled = await data.module.guildCommandEnabled(data.config, data.admin);
        if(!modEnabled){return false;}
        if(this.Hyperion.global.disabledCommands.includes(data.parent ? data.parent.name : data.command.name) && !(data.admin || data.dev)){return false;}
        if(data.parent){
            const commandSettings = data.config.commands[data.parent.name];
            if(commandSettings){
                if(!commandSettings.enabled){return false;}
                const subSettings = (commandSettings.subcommands ?? {})[data.command.name];
                if(subSettings?.enabled !== undefined && subSettings.enabled === false){return false;}
            }
        }else{
            const commandSettings = data.config.commands[data.command.name];
            if(commandSettings){
                if(!commandSettings.enabled){return false;}
            }
        }
        return true;
    }

    async auth(data: identifyResult): Promise<boolean> {
        if(data.module.private || data.command.private){return await this.specialAuth(data);}
        if(data.admin){return true;}
        let commandSettings = data.config.commands[data.parent ? data.parent.name : data.command.name];
        commandSettings ??= {enabled: true, allowedRoles: [], allowedChannels: [], disabledRoles: [], disabledChannels: []};
        const isManager = data.member.permissions.has("manageGuild");
        const isMod = this.Hyperion.utils.arrayShared(data.member.roles, data.config.mod.modRoles);
        const hasAllowedRole = this.Hyperion.utils.arrayShared(data.member.roles, commandSettings.allowedRoles);
        const hasDisabledRole = this.Hyperion.utils.arrayShared(data.member.roles, commandSettings.disabledRoles);
        const isDisabledChannel = commandSettings.disabledChannels.includes(data.channel.id);
        const isAllowedChannel = commandSettings.allowedChannels.includes(data.channel.id);
        if(!isManager){
            if(hasDisabledRole && !hasAllowedRole){return false;}
            if(hasAllowedRole){return true;}
        }
        if(!isMod){
            if(isDisabledChannel){return false;}
            if(commandSettings.allowedChannels.length !== 0 && !isAllowedChannel){return false;}
            if(isAllowedChannel){return true;}
            if(data.command.perms){return false;}
            if(data.config.ignoredChannels.includes(data.channel.id) || data.config.ignoredUsers.includes(data.member.id) || this.Hyperion.utils.arrayShared(data.member.roles, data.config.ignoredRoles)){
                return false;
            }
        } else {
            if(data.command.perms && data.command.perms === "manager"){return false;}
        }
        return true;
    }

    async specialAuth(data: identifyResult): Promise<boolean> {
        if(data.command.specialPerms === "dev"){
            return data.acks.dev;
        }
        if(data.command.specialPerms === "admin"){
            return data.acks.dev || data.acks.admin;
        }
        if(data.command.specialPerms === "staff"){
            return data.acks.dev || data.acks.admin || data.acks.staff;
        }
        if(data.command.specialPerms === "support"){
            return data.acks.dev || data.acks.admin || data.acks.staff || data.acks.support;
        }
        if(data.command.specialPerms === "contrib"){
            return data.acks.dev || data.acks.admin || data.acks.contrib;
        }
        if(data.command.specialPerms === "friend"){
            return data.acks.dev || data.acks.admin || data.acks.friend;
        }
        return false;
    }

    async help(data: partialIdentifyResult): Promise<void> {
        const onCooldown = await this.onCooldown({member: data.member, command: {cooldown: 2, name: "help"}} as identifyResult);
        const t = this.Hyperion.lang.getLang(data.config.lang).format;
        if(onCooldown){
            if(this.sentCooldowns[data.member.id] === undefined){
                this.sentCooldowns[data.member.id] = Date.now();
                const coolmsg = await data.channel.createMessage(t("slowDown", [data.member.friendlyName])).catch(() => undefined);
                if(coolmsg){
                    setTimeout(delCool.bind(coolmsg as Message<GuildTextableChannel>), 3000);
                }
            }
            return;
        }
        if(data.args[0]){
            this.commandHelp(data);
            return;
        }
        const fields: Array<EmbedField> = [];
        const cats = [...this.Hyperion.modules.values()].filter(m => {
            if(!m.hasCommands){return false;}
            if(m.pro){
                if(!(data.config.pro || data.config.dev)){return false;}
            }
            if(m.private){
                if(!data.config.dev){return false;}
                if(!(data.acks.dev || data.acks.admin)){return false;}
            }
            return true;
        });
        for(const cat of cats){
            const cmds = [...this.Hyperion.commands.values()].filter(c => {
                if(c.specialPerms && !data.acks[c.specialPerms]){return false;}
                if(c.listUnder === cat.name){return true;}
                return false;
            }).map(c => c.name);
            if(cmds.length !== 0){fields.push({name: cat.friendlyName, value: cmds.join(", ")});}
        }
        data.channel.createMessage({embed: {
            title: `${this.Hyperion.client.user.username} Help`,
            description: "[" +  t("inviteHere", [this.Hyperion.client.user.username]) +"](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&scope=bot&permissions=2110123134)\n[" + t("supportHere") +"](https://discord.gg/Vd8vmBD)\n[" + t("docsHere") + "](https://docs.hyperionbot.xyz)",
            color: this.Hyperion.colors.default,
            timestamp: new Date,
            fields
        }}).catch(() => undefined);
        await this.setCooldown({member: data.member, command: {cooldown: 2, name: "help"}} as identifyResult);
    }
    
    async commandHelp(data: partialIdentifyResult): Promise<void> {
        if(["253233185800847361", "<@253233185800847361>", "<@!253233185800847361>"].includes(data.args[0])){
            data.channel.createMessage("If you're reading this, you've been in a coma for almost 20 years now. We're trying a new technique. We don't know where this message will end up in your dream, but we hope it works. Please wake up, we miss you.").catch(() => undefined);
            await this.setCooldown({member: data.member, command: {cooldown: 2, name: "help"}} as identifyResult);
            return;
        }
        const command = this.findCommand(data.args[0]);
        if(!command){return;}
        if(!(data.acks.support || data.acks.staff || data.acks.admin || data.acks.dev) && command.private){return;}
        const t = this.Hyperion.lang.getLang(data.config.lang).format;
        let info = `**${this.Hyperion.utils.toCap(t("description"))}:** ${t(`${command.name}.detail`)}\n**${this.Hyperion.utils.toCap(t("cooldown"))}:** ${command.cooldown} ${t("seconds")}`;
        if(command.aliases.length !== 0){
            info += `\n**${this.Hyperion.utils.toCap(t("aliases"))}:** ${command.aliases.join(", ")}`;
        }
        if(command.perms){
            info += `\n**${t("help.permissionlevel")}:** ${this.Hyperion.utils.toCap(t(command.perms))}`;
        }
        if(command.help.subcommands){
            info += `\n**${this.Hyperion.utils.toCap(t("subcommands"))}: **\n${t(`${command.name}.subcommands`, [data.config.prefix])}`;
        }
        info += `\n**${this.Hyperion.utils.toCap(t("usage"))}:** \n${t(`${command.name}.usage`, [data.config.prefix])}`;
        if(command.help.example){
            info += `\n**${this.Hyperion.utils.toCap(t("examples"))}:** ${t(`${command.name}.example`, [data.config.prefix])}`;
        }
        data.channel.createMessage({embed: {
            title: `${t("helpFor")} ${data.config.prefix}${command.name}`,
            color: this.Hyperion.colors.default,
            timestamp: new Date,
            description: info
        }}).catch(() => undefined);
        await this.setCooldown({member: data.member, command: {cooldown: 2, name: "help"}} as identifyResult);
    }

    diagnoseAuth(data: partialIdentifyResult): boolean {
        if(!this.isMod(data.member, data.config)){
            if(!(data.acks.support || data.acks.staff || data.acks.admin || data.acks.dev)){
                return false;
            }
        }
        return true;
    }

    async diagnose(): Promise<void> {
        //piss
    }

    async execute(data: identifyResult): Promise<void> {
        const onCooldown = await this.onCooldown(data);
        if(onCooldown){
            if(this.sentCooldowns[data.member.id] === undefined){
                this.sentCooldowns[data.member.id] = Date.now();
                const t = this.Hyperion.lang.getLang(data.config.lang).format;
                const coolmsg = await data.channel.createMessage(t("slowDown", [data.member.friendlyName])).catch(() => undefined);
                if(coolmsg){
                    setTimeout(delCool.bind(coolmsg as Message<GuildTextableChannel>), 3000);
                }
            }
            return;
        }
        const ctx: CommandContext = {
            msg: data.msg,
            channel: data.channel,
            guild: data.guild,
            command: data.command,
            module: data.module,
            content: data.content,
            args: data.args,
            member: data.member,
            dev: data.dev,
            admin: data.admin,
            acks: data.acks,
            createMessage: createMessage,
            config: data.config,
            t: this.Hyperion.lang.getLang(data.config.lang).format
        };
        ctx.createMessage = ctx.createMessage.bind(ctx);
        const result = await data.command.execute(ctx).catch(err => {
            if(data.config.dev || data.acks.dev){
                data.channel.createMessage(err.message).catch(() => undefined);
            }else{
                data.channel.createMessage(this.Hyperion.lang.getLang(data.config.lang).format("error")).catch(() => undefined);
            }
            this.Hyperion.sentry.configureScope((scope) => {
                scope.setExtras({
                    "Command String": ctx.content,
                    "Guild": ctx.guild.id,
                    "User": ctx.member.id
                });
            });
            return null;
        });
        if(result === null){return;}
        this.postExecute(data, result);
    }

    async postExecute(data: identifyResult, result: CommandResponse): Promise<void> {
        if(result.success){await this.setCooldown(data);}
        this.updateCommandStats(data);
        if(!result.content || result.self){return;}
        if(result.showHelp){
            //help stuff
            return;
        }
        if(result.literal){
            if(typeof result.content === "string"){
                if(result.status){
                    result.content = this.Hyperion.emotes[result.status] + " " + result.content;
                }
            }else{
                if(result.status){
                    result.content.content = this.Hyperion.emotes[result.status] + " " + result.content.content;
                }
            }
            data.channel.createMessage(result.content).catch(() => undefined);
            return;
        } else {
            if(typeof result.content === "string"){
                result.content = this.Hyperion.lang.getLang(data.config.lang).format(result.content, result.langMixins ??= []);
                if(result.status){
                    result.content = this.Hyperion.emotes[result.status] + " " + result.content;
                }
            }else {
                if(result.content){
                    result.content.content = this.Hyperion.lang.getLang(data.config.lang).format(result.content.content!, result.langMixins ??= []);
                    if(result.status){
                        result.content.content = this.Hyperion.emotes[result.status] + " " + result.content.content;
                    }
                }
            }
        }
        data.channel.createMessage(result.content).catch(() => undefined);
        
    }

    isMod(member: Member, config: GuildType): boolean {
        if(this.Hyperion.utils.arrayShared(config.mod.modRoles, member.roles)){return true;}
        if(member.permissions.has("manageGuild")){return true;}
        return false;
    }

    updateCommandStats(data: identifyResult): void {
        this.Hyperion.redis.incr("lcr");
        const com = data.parent ? `${data.parent.name}:${data.command.name}` : data.command.name;
        this.Hyperion.redis.incr(`CommandStats:${com}`);
    }

    async setCooldown(data: identifyResult): Promise<void> {
        const id = data.member.id;
        if(data.admin || data.dev){return;}
        const comString = `cooldown:${id}:${data.parent ? `${data.command.name}:${data.parent.name}` : `${data.command.name}`}`;
        const length = data.command.cooldown;
        await this.Hyperion.redis.set(comString, 1, "EX", length).catch(err => {this.Hyperion.logger.warn("Hyperion", `Failed to set command cooldown for ${data.member.id}, ${data.parent ? `${data.parent.name}:${data.command.name}` : data.command.name}, err: ${err.message}`, "Cooldowns");});
        await this.Hyperion.redis.set(`globalcooldown:${id}`, 1, "EX", 1).catch(err => {this.Hyperion.logger.warn("Hyperion", `Failed to set global cooldown for ${data.member.id}, err: ${err.message}`, "Cooldowns");});
    }

    async onCooldown(data: identifyResult): Promise<boolean> {
        //if(data.dev || data.admin){return false;}
        const comString = `cooldown:${data.member.id}:${data.parent ? `${data.command.name}:${data.parent.name}` : `${data.command.name}`}`;
        const com = await this.Hyperion.redis.get(comString);
        const global = await this.Hyperion.redis.get(`globalcooldown:${data.member.id}`);
        if(com || global){return true;}
        return false;
    }

    isolate(input: string, guildConfig: GuildType, acks: ack): {
        command: string; 
        args: Array<string>;
        dev?: boolean;
        admin?: boolean;
    } | undefined {
        const mentionRX = new RegExp("<@!", "gmi");
        input = input.replace(mentionRX, "<@");
        const mention = this.Hyperion.client.user.mention;

        if(guildConfig.casualPrefix && input.toLowerCase().startsWith(this.Hyperion.client.user.username.toLowerCase() + " ")){
            const args = input.split(" ").slice(1);
            if(args.length === 0){return;}
            const command = args.shift()!;
            return {command, args};
        }

        if(input.startsWith(mention + " ")){
            const args = input.split(" ").slice(1);
            if(args.length === 0){return;}
            const command = args.shift()!;
            return {command, args};
        }

        if(acks.dev && input.startsWith(this.Hyperion.devPrefix)){
            const args = input.split(" ");
            if(args.length === 0){return;}
            const command = args.shift()!.substring(this.Hyperion.devPrefix.length);
            return {command, args, admin: true, dev: true};
        }

        if((acks.dev || acks.admin) && input.startsWith(this.Hyperion.adminPrefix)){
            const args = input.split(" ");
            if(args.length === 0){return;}
            const command = args.shift()!.substring(this.Hyperion.adminPrefix.length);
            return {command, args, admin: true};
        }

        if(input.startsWith(guildConfig.prefix)){
            const args = input.split(" ");
            if(args.length === 0){return;}
            const command = args.shift()!.substring(guildConfig.prefix.length);
            return {command, args};
        }
    }

    findCommand(label: string): Command | undefined { 
        label = label.toLowerCase();
        let cmd = this.Hyperion.commands.get(label);
        if(!cmd){
            cmd = [...this.Hyperion.commands.values()].find(c => c.aliases.includes(label));
        }
        if(!cmd){
            const find = [...this.Hyperion.commands.values()].filter(c => c.name.startsWith(label) && c.perms !== "mod");
            if(find.length === 1){
                cmd = find[0];
            }
        }
        return cmd;
    }

    findSubcommand(command: Command, label: string): Command | undefined {
        if(!command.subcommands){return;}
        let subcmd = command.subcommands.get(label);
        if(!subcmd){
            subcmd = [...command.subcommands.values()].find(c => c.aliases.includes(label));
        }
        if(!subcmd){
            const find = [...command.subcommands.values()].filter(c => c.name.startsWith(label));
            if(find.length === 1){
                subcmd = find[0];
            }
        }
        return subcmd;
    }

    async onLoad(){
        this.cooldownInterval = setInterval(this.clearMessageCooldown.bind(this), 5000);
        return true;
    }

    clearMessageCooldown(): void {
        for(const data of Object.entries(this.sentCooldowns)){
            if((Date.now() - data[1]) > 5000){
                delete this.sentCooldowns[data[0]];
            }
        }
    }

    async onUnload(){
        clearInterval(this.cooldownInterval);
        return true;
    }
}