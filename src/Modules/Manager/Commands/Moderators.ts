import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Embed } from "eris";

class Moderators extends Command{
    constructor(){
        super({
            name: "moderators",
            aliases: ["mods"],
            module: "manager",
            userperms: ["manager"],
            helpDetail: "Show and manage server moderators.",
            helpUsage: "{prefix}moderators\n{prefix}moderators add [role]\n{prefix}moderators remove [role]",
            helpUsageExample: "{prefix}moderators add Mods\n{prefix}moderators remove Helpers"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        if(!ctx.args[0] || ctx.args[0].toLowerCase() === "list"){
            return this.list(ctx, Hyperion);
        }
        if(ctx.args[0].toLowerCase() === "add"){
            return await this.add(ctx, Hyperion);
        }
        if(ctx.args[0].toLowerCase() === "remove"){
            return await this.remove(ctx, Hyperion);
        }
        return this.list(ctx, Hyperion);
        
    }

    list(ctx: ICommandContext, Hyperion: IHyperion): {embed: Partial<Embed>}{
        const admins = ctx.guild.roles.filter(r => r.permissions.has("administrator") && !r.managed).map(r => r.mention);
        const managers = ctx.guild.roles.filter(r => r.permissions.has("manageGuild") && !r.permissions.has("administrator") && !r.managed).map(r => r.mention);
        const modroles = ctx.guildConfig?.mod?.modRoles ?? [];
        const mods = ctx.guild.roles.filter(r => modroles.includes(r.id) && !r.managed).map(r => r.mention);
        const fieldarr: Array<{name: string; value: string; inline: boolean}> = [];
        const data = {
            embed: {
                title: "Moderators",
                timestamp: new Date,
                color: Hyperion.defaultColor,
                fields: fieldarr
            }
        };
        if(admins.length > 0){
            data.embed.fields.push({name: "Administrators", value: admins.join("\n"), inline: false});
        }else{
            data.embed.fields.push({name: "Administrators", value: "None", inline: false});
        }

        if(managers.length > 0){
            data.embed.fields.push({name: "Managers", value: managers.join("\n"), inline: false});
        }else{
            data.embed.fields.push({name: "Managers", value: "None", inline: false});
        }

        if(mods.length > 0){
            data.embed.fields.push({name: "Moderators", value: mods.join("\n"), inline: false});
        }else{
            data.embed.fields.push({name: "Moderators", value: "None", inline: false});
        }
        return data;
    }

    async add(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please enter a role to add!";}
        const role = Hyperion.utils.resolveRole(ctx.args[1], ctx.guild.roles);
        if(!role){return "Invalid role provided!";}
        let roles = ctx.guildConfig?.mod?.modRoles;
        if(!roles){
            roles = [role.id];
        }else{
            roles.push(role.id);
        }
        await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "mod", {modRoles: roles});
        return `Added ${role.name} as a moderator role!`;
    }

    async remove(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[1]){return "Please enter a role to remove!";}
        const role = Hyperion.utils.resolveRole(ctx.args[1], ctx.guild.roles);
        if(!role){return "Invalid role provided!";}
        const roles = ctx.guildConfig?.mod?.modRoles;
        if(!roles || !roles.includes(role.id)){return "That role isnt added as mod!";}
        const index = roles.indexOf(role.id);
        if(index > -1){
            roles.splice(index, 1);
        }
        await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "mod", {modRoles: roles});
        return `Removed ${role.name} as a moderator role!`;
    }
}
export default Moderators;