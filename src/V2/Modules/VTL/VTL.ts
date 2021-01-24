import { Collection, Member, TextChannel, VoiceChannel } from "eris";
import {ConfigKey, Module} from "../../Structures/Module";
import { IHyperion } from "../../types";
import {VTL as vtlconfig} from "../../Structures/MongoGuildManager";

class VTL extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "vtl",
            friendlyName: "VTL",
            private: false,
            alwaysEnabled: false,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: true,
            dirname: __dirname,
            pro: true,
            subscribedEvents: [
                "voiceChannelJoin",
                "voiceChannelLeave",
                "voiceChannelSwitch"
            ],
            defaultStatus: true
        }, Hyperion);
        this.configKeys = this.loadKeys();
    }

    async getConfig(guild: string): Promise<vtlconfig>{
        return await this.Hyperion.managers.guild.getModuleConfig<vtlconfig>(guild, this.name);
    }


    async voiceChannelJoin(...args: [Member, VoiceChannel]): Promise<void>{
        const member = args[0];
        const channel = args[1];
        const enabled = await this.checkGuildEnabled(channel.guild.id);
        if(!enabled){return;}
        const guild = channel.guild;
        const config = await this.getConfig(guild.id);
        if(config.links[channel.id] !== undefined){
            this.onJoin(member, channel, config);
        }
    }

    async voiceChannelLeave(...args: [Member, VoiceChannel]): Promise<void>{
        const member = args[0];
        const channel = args[1];
        const enabled = await this.checkGuildEnabled(channel.guild.id);
        if(!enabled){return;}
        const guild = channel.guild;
        const config = await this.getConfig(guild.id);
        if(config.links[channel.id] !== undefined){
            this.onLeave(member, channel, config);
        }
    }

    async voiceChannelSwitch(...args: [Member, VoiceChannel, VoiceChannel]): Promise<void>{
        const member = args[0];
        const channel = args[1];
        const oldChannel = args[2];
        const enabled = await this.checkGuildEnabled(channel.guild.id);
        if(!enabled){return;}
        const guild = channel.guild;
        const config = await this.getConfig(guild.id);
        if(config.links[channel.id] !== undefined){
            this.onJoin(member, channel, config);
        }
        if(config.links[oldChannel.id] !== undefined){
            this.onLeave(member, oldChannel, config);
        }
    }

    async onJoin(member: Member, channel: VoiceChannel, config: vtlconfig): Promise<void>{
        const guild = channel.guild;
        const textChannel = config.links[channel.id];
        const txtchannel = guild.channels.get(textChannel);
        if(!txtchannel){return;}
        if(config.joinAnnouncements){(txtchannel as TextChannel).createMessage(`${member.mention} joined the channel`).catch(() => undefined);}
        await txtchannel.editPermission(member.id, (1 << 10), 0, "member", "VTL").catch(() => undefined);
    }

    async onLeave(member: Member, channel: VoiceChannel, config: vtlconfig): Promise<void>{
        const guild = channel.guild;
        const textChannel = config.links[channel.id];
        const txtchannel = guild.channels.get(textChannel);
        if(!txtchannel){return;}
        if(config.leaveAnnouncements){(txtchannel as TextChannel).createMessage(`${member.mention} left the channel`).catch(() => undefined);}
        await txtchannel.deletePermission(member.id, "VTL");
    }

    loadKeys(): Collection<ConfigKey>{
        const col = new Collection(ConfigKey);
        col.add(new ConfigKey({
            parent: this.name,
            id: "joinAnnouncements",
            ops: [0, 1, 4],
            description: "If Hyperion will send a message when a user joins a VTL channel",
            friendlyName: "Join Announcements",
            dataType: "boolean",
            array: false,
            default: false
        }));

        col.add(new ConfigKey({
            parent: this.name,
            id: "leaveAnnouncements",
            ops: [0, 1, 4],
            description: "If Hyperion will send a message when a user leaves a VTL channel",
            friendlyName: "Leave Announcements",
            dataType: "boolean",
            array: false,
            default: false
        }));
        return col;
    }
}
export default VTL;