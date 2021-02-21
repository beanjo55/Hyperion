import Module from "../../Structures/Module";
import hyperion from "../../main";
import { Embed, EmbedField, Message } from "eris";

export default class Help extends Module<Record<string, never>> {
    constructor(Hyperion: hyperion){
        super({
            name: "help",
            dir: __dirname,
            path: __dirname + "/Help.js",
            hasCommands: false,
            alwaysEnabled: true,
            subscribedEvents: ["messageCreate"],
            private: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }

    async onUnload(){
        return true;
    }

    // eslint-disable-next-line complexity
    async messageCreate(...args: [Message]): Promise<void> {
        const msg = args[0];
        const channel = msg.channel;
        if(!(channel.type === 0 || channel.type === 5)){return;}
        const guild = channel.guild;
        const acks = await this.Hyperion.utils.getAcks(msg.author.id);
        const config = await this.Hyperion.manager.guild().get(guild.id);
        const t = this.Hyperion.lang.getLang(config.lang).format;
        const opts: {pro?: boolean; dev?: boolean} = {};
        if(config.pro === true){opts.pro = true;}
        if(config.dev === true){opts.dev = true;}

        if(acks.dev && msg.content.startsWith(this.Hyperion.devPrefix)){
            if(msg.content.toLowerCase() === `${this.Hyperion.devPrefix}help`){
                channel.createMessage({embed: this.generalHelp(t, opts)}).catch(() => undefined);
                return;
            }
            if(msg.content.startsWith(`${this.Hyperion.devPrefix}help`)){
                const cmd = msg.content.split(" ")[1];
                channel.createMessage({embed: this.commandHelp(t, cmd, config.prefix, opts)}).catch(() => undefined);
                return;
            }
            return;
        }

        if((acks.dev || acks.admin) && msg.content.startsWith(this.Hyperion.adminPrefix)){
            if(msg.content.toLowerCase() === `${this.Hyperion.adminPrefix}help`){
                channel.createMessage({embed: this.generalHelp(t, opts)}).catch(e => console.log(e));
                return;
            }
            if(msg.content.startsWith(`${this.Hyperion.adminPrefix}help`)){
                const cmd = msg.content.split(" ")[1];
                channel.createMessage({embed: this.commandHelp(t, cmd, config.prefix, opts)}).catch(() => undefined);
                return;
            }
            return;
        }

        if(config.casualPrefix){
            if(msg.content.toLowerCase() === `${this.Hyperion.name} help`){
                channel.createMessage({embed: this.generalHelp(t, opts)}).catch(() => undefined);
                return;
            }
            if(msg.content.startsWith(`${this.Hyperion.name} help`)){
                const cmd = msg.content.split(" ")[2];
                channel.createMessage({embed: this.commandHelp(t, cmd, config.prefix, opts)}).catch(() => undefined);
                return;
            }
        }

        if(msg.content.toLowerCase() === `<@${this.Hyperion.client.user.id}> help ` || msg.content.toLowerCase() === `<@!${this.Hyperion.client.user.id}> help `){
            channel.createMessage({embed: this.generalHelp(t, opts)}).catch(() => undefined);
            return;
        }

        if(msg.content.startsWith(`<@${this.Hyperion.client.user.id}> help`) || msg.content.startsWith(`<@!${this.Hyperion.client.user.id}> help`)){
            const cmd = msg.content.split(" ")[2];
            channel.createMessage({embed: this.commandHelp(t, cmd, config.prefix, opts)}).catch(() => undefined);
            return;
        }

        if(msg.content.toLowerCase() === `${config.prefix}help `){
            channel.createMessage({embed: this.generalHelp(t, opts)}).catch(() => undefined);
            return;
        }

        if(msg.content.startsWith(`${config.prefix}help`)){
            const cmd = msg.content.split(" ")[1];
            channel.createMessage({embed: this.commandHelp(t, cmd, config.prefix, opts)}).catch(() => undefined);
            return;
        }
    }

    commandHelp(t: (input: string, extra?: Array<string>) => string, command: string, prefix: string, opts: {pro?: boolean; dev?: boolean}): Embed {
        if(!command || command === ""){return this.generalHelp(t, opts);}
        const cmd = this.Hyperion.commands.get(command) ?? [...this.Hyperion.commands.values()].find(c => c.aliases.includes(command));
        if(cmd){
            let info = `**${this.Hyperion.utils.toCap(t("description"))}:** ${t(`${cmd.name}.detail`)}\n**${this.Hyperion.utils.toCap(t("cooldown"))}:** ${cmd.cooldown} ${t("seconds")}`;
            if(cmd.aliases.length !== 0){
                info += `\n**${this.Hyperion.utils.toCap(t("aliases"))}:** ${cmd.aliases.join(", ")}`;
            }
            if(cmd.perms){
                info += `\n**${t("help.permissionlevel")}:** ${this.Hyperion.utils.toCap(t(cmd.perms))}`;
            }
            if(cmd.help.subcommands){
                info += `\n**${this.Hyperion.utils.toCap(t("subcommands"))}: **\n${t(`${cmd.name}.subcommands`, [prefix])}`;
            }
            info += `\n**${this.Hyperion.utils.toCap(t("usage"))}:** \n${t(`${cmd.name}.usage`, [prefix])}`;
            if(cmd.help.example){
                info += `\n**${this.Hyperion.utils.toCap(t("examples"))}:** ${t(`${cmd.name}.example`, [prefix])}`;
            }
            return {
                title: `${t("helpFor")} ${prefix}${cmd.name}`,
                color: this.Hyperion.colors.default,
                timestamp: new Date,
                description: info,
                type: "rich"
            };
        }
        const v2cmd = this.Hyperion.V2.commands.get(command) ?? this.Hyperion.V2.commands.find(c => c.aliases.includes(command));
        if(v2cmd){
            const rx = new RegExp("{prefix}", "gmi");
            let info = `**Description:** ${v2cmd.helpDetail}\n**Cooldown:** ${v2cmd.cooldownTime/1000} seconds`;
            if(v2cmd.aliases.length !== 0){
                info += `\n**Aliases:** ${v2cmd.aliases.join(", ")}`;
            }
            if(v2cmd.userperms.length !== 0){
                if(v2cmd.userperms.includes("manager")){info += "\n**Permission Level:** Manager";}
                if(v2cmd.userperms.includes("mod")){info += "\n**Permission Level:** Moderator";}
            }
            if(v2cmd.hasSub && !v2cmd.noSubList){
                info += `\n**Subcommands:**\n${v2cmd.helpSubcommands.replace(rx, prefix)}`;
            }
            info += `\n**Usage:**\n${v2cmd.helpUsage.replace(rx, prefix)}`;
            if(!v2cmd.noExample){
                info += `\n**Examples:**\n${v2cmd.helpUsageExample.replace(rx, prefix)}`;
            }
            return {
                title: `Help for ${prefix}${v2cmd.name}`,
                color: this.Hyperion.colors.default,
                timestamp: new Date(),
                description: info,
                type: "rich"
            };
        
        }
        return this.generalHelp(t, opts);
    }

    generalHelp(t: (input: string, extra?: Array<string>) => string, opts: {pro?: boolean; dev?: boolean}): Embed {
        opts ??= {};
        const cats: Record<string, Array<string>> = {};
        [...this.Hyperion.modules.values()].filter(m => {
            if(!m.hasCommands){return false;}
            if(m.private && !opts!.dev){return false;}
            if(m.pro && !(opts!.dev || opts!.pro)){return false;}
            return true;
        }).forEach(m => {
            cats[m.name] = [];
            cats[m.name] = cats[m.name].concat([...this.Hyperion.commands.values()].filter(c => {
                if(c.listUnder === m.name){return true;}
                return false;
            }).map(c => c.name));
        });
        this.Hyperion.V2.modules.filter(m => {
            if(!m.hasCommands){return false;}
            if(m.private && !opts!.dev){return false;}
            if(m.pro && !(opts!.dev || opts!.pro)){return false;}
            return true;
        }).forEach(m => {
            if(cats[m.name] === undefined){cats[m.name] = [];}
            cats[m.name] = cats[m.name].concat(this.Hyperion.V2.commands.filter(c => {
                if(c.listUnder){
                    if(c.listUnder === m.name){return true;}
                }else{
                    if(c.module === m.name){return true;}
                }
                return false;
            }).map(c => c.name));
        });
        const fields: Array<EmbedField> = [];
        for(const cat of Object.entries(cats)){
            const module = this.Hyperion.modules.get(cat[0]) ?? this.Hyperion.V2.modules.get(cat[0]);
            if(!module){throw new Error("GhostModule!");}
            const name = module.friendlyName;
            if(cat[1].length === 0){continue;}
            fields.push({name, value: cat[1].join(", ")});
        }
        return {
            title: `${this.Hyperion.client.user.username} Help`,
            description: "[" +  t("inviteHere", [this.Hyperion.client.user.username]) +"](https://discordapp.com/oauth2/authorize?client_id=633056645194317825&scope=bot&permissions=2110123134)\n[" + t("supportHere") +"](https://discord.gg/Vd8vmBD)\n[" + t("docsHere") + "](https://docs.hyperionbot.xyz)",
            color: this.Hyperion.colors.default,
            timestamp: new Date,
            fields,
            type: "rich"
        };
        
    }
}