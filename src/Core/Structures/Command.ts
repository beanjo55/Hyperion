/* eslint-disable complexity */
import {Collection, EmbedField, Guild} from "eris";
import {IHyperion, ICommandContext, EmbedResponse} from "../../types";

export class Command{
    name: string;
    id: string;
    module: string;
    aliases: Array<string>;
    internal: boolean;
    alwaysEnabled: boolean;
    userperms: Array<string>;
    botperms: Array<string>;
    needsRolepos: boolean;
    dev: boolean;
    admin: boolean;
    support: boolean;
    cooldownTime: number;
    helpDetail: string;
    helpAliases: string;
    helpSubcommands: string;
    helpUsage: string;
    helpUsageExample: string;
    noExample: boolean;
    hasSub: boolean;
    selfResponse: boolean;
    subcommands?: Collection<Command>;
    friend: boolean;
    contrib: boolean;
    unlisted: boolean;
    noSubList = false;
    listUnder: string;
    diagnoseAddon?(Hyperion: IHyperion, guild: Guild): Promise<string | EmbedField>

    constructor(data: Partial<Command>){
        this.name = data.name ?? "dummy";
        this.id = this.name;
        this.module = data.module ?? "default";
        this.aliases = data.aliases ?? [];

        this.internal = data.internal ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;

        this.userperms = data.userperms ?? [];
        this.botperms = data.botperms ?? [];
        this.needsRolepos = data.needsRolepos ?? false;

        this.dev = data.dev ?? false;
        this.admin = data.admin ?? false;
        this.support = data.support ?? false;

        this.cooldownTime = data.cooldownTime ?? 2000;

        this.helpDetail = data.helpDetail ?? "dummy";
        this.helpAliases = data.helpAliases ?? "dummy";
        this.helpSubcommands = data.helpSubcommands ?? "dummy";
        this.helpUsage = data.helpUsage ?? "dummy";
        this.helpUsageExample = data.helpUsageExample ?? "dummy";
        this.noExample = data.noExample ?? false;

        this.hasSub = data.hasSub ?? false;

        this.selfResponse = data.selfResponse ?? false;
        if(this.hasSub){
            this.subcommands = new Collection(Command);
        }

        this.friend = data.friend ?? false;
        this.contrib = data.contrib ?? false;
        this.unlisted = data.unlisted ?? false;
        if(data.noSubList !== undefined){
            this.noSubList = data.noSubList;
        }
        this.listUnder = data.listUnder ?? this.module;
    }


    //dummy default command 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<unknown>{
        throw new Error("Unimplemented command!");
    }

    async deleteAfterUse(ctx: ICommandContext, Hyperion: IHyperion): Promise<void>{
        if(!ctx.channel.permissionsOf(Hyperion.client.user.id).has("manageMessages")){return;}
        try{
            await ctx.msg.delete();
            await Hyperion.redis.set(`Deleted:${ctx.msg.id}`, 1, "EX", 5);
        // eslint-disable-next-line no-empty
        }catch{}
    }

    async modDeleteAfter(ctx: ICommandContext, Hyperion: IHyperion): Promise<void>{
        if(ctx.guildConfig.mod?.deleteCommand){this.deleteAfterUse(ctx, Hyperion);}
    }

    async diagnose(Hyperion: IHyperion, guild: Guild): Promise<EmbedResponse | null>{
        if(this.unlisted){return null;}
        const commandConfig = await Hyperion.managers.guild.getCommandState(guild.id, this.name);
        const module = Hyperion.modules.get(this.module);
        if(!module){throw new Error("Can not find command module");}
        let error = false;
        const data: EmbedResponse = {
            embed: {
                title: `Status for {prefix}${this.name}`,
                fields: [
                    {name: "Enabled", value: commandConfig.enabled ? "Yes" : "No", inline: true},
                    {name: "Module Enabled", value: await module.checkGuildEnabled(guild.id) ? "Yes" : "No", inline: true},
                    {name: "Required Roles", value: commandConfig.allowedRoles.length !== 0 ? commandConfig.allowedRoles.map(r => `<@&${r}>`).join("\n") : "None", inline: true},
                    {name: "Required Channels", value: commandConfig.allowedChannels.length !== 0 ? commandConfig.allowedChannels.map(r => `<#${r}>`).join("\n") : "None", inline: true},
                    {name: "Disabled Roles", value: commandConfig.disabledRoles.length !== 0 ? commandConfig.disabledRoles.map(r => `<@&${r}>`).join("\n") : "None", inline: true},
                    {name: "Required Roles", value: commandConfig.disabledChannels.length !== 0 ? commandConfig.disabledChannels.map(r => `<#${r}>`).join("\n") : "None", inline: true}
                ],
                timestamp: new Date,
                color: Hyperion.colors.green
            }
        };
        if(Hyperion.global.gDisabledMods.includes(module.name)){
            data.embed.description ? data.embed.description += "This command's module has been globally disabled and can not be used" : data.embed.description = "This command's module has been globally disabled and can not be used";
            data.embed.fields![0].value = "No";
        }
        if(Hyperion.global.gDisabledCommands.includes(this.name)){
            data.embed.description ? data.embed.description += "This command has been globally disabled and can not be used" : data.embed.description = "This command has been globally disabled and can not be used";
            data.embed.fields![0].value = "No";
        }
        if(this.botperms.length !== 0){
            const missing: Array<string> = [];
            const botUser = guild.members.get(Hyperion.client.user.id);
            if(!botUser){throw new Error("Could not find bot user");}
            for(const perm of this.botperms){
                if(!botUser.permission.has(perm)){missing.push(perm);}
            }
            if(missing.length !== 0){
                data.embed.fields!.push({name: "Permissions", value: `Hyperion is missing the following permissions: ${missing.join(", ")}`});
                error = true;
            }else{
                data.embed.fields!.push({name: "Permissions", value: "Hyperion has all the needed permissions for this command"});
            }
        }
        if(data.embed.fields![0].value === "No" || data.embed.fields![1].value === "No" || error){
            data.embed.color = Hyperion.colors.red;
        }
        return data;
    }

}
