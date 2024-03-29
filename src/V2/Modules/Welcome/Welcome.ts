import {Module, ConfigKey} from "../../Structures/Module";
import { IHyperion, WelcomeConfig } from "../../types";
import { Guild, Member } from "eris";
import { Collection } from "eris";

class Welcome extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "welcome",
            friendlyName: "Welcome",
            defaultStatus: false,
            hasCfg: true,
            subscribedEvents: ["guildMemberAdd"]
        }, Hyperion);
        this.configKeys = this.loadKeys();
    }

    async getConfig(guild: string): Promise<WelcomeConfig>{
        return await this.Hyperion.managers.guild.getModuleConfig<WelcomeConfig>(guild, this.name);
    }

    parseVars(guild: Guild, member: Member, input: string): string{
        const rx1 = new RegExp("{user}", "gmi");
        const rx2 = new RegExp("{username}", "gmi");
        const rx3 = new RegExp("{usertag}", "gmi");
        const rx4 = new RegExp("{membercount}", "gmi");
        return input.replace(rx1, member.mention).replace(rx2, member.username).replace(rx3, `${member.username}#${member.discriminator}`).replace(rx4, guild.memberCount.toString());
    }

    async guildMemberAdd(...args: [Guild, Member]): Promise<void>{
        const guild = args[0];
        const member = args[1];
        if(member.bot){return;}
        if(!await this.checkGuildEnabled(guild.id)){return;}
        const config = await this.getConfig(guild.id);
        if(!config.channel || !config.content || config.channel === "" || config.content === ""){return;}
        const channel = guild.channels.get(config.channel!);
        if(!channel || !(channel.type === 5 || channel.type === 0)){return;}
        channel.createMessage(this.parseVars(guild, member, config.content as string));
    }

    loadKeys(): Collection<ConfigKey>{
        const col = new Collection(ConfigKey);
        col.add({
            parent: this.name,
            id: "channel",
            ops: [0, 1, 4],
            description: "The channel the welcome message will be posted in.",
            friendlyName: "Channel",
            dataType: "channel",
            array: false,
            default: ""
        });

        col.add({
            parent: this.name,
            id: "content",
            ops: [0, 1, 4],
            description: "The content the welcome message will have.",
            friendlyName: "Content",
            dataType: "string",
            array: false,
            default: ""
        });
        return col;
    }
}
export default Welcome;
