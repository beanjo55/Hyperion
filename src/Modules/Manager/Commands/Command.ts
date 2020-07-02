import {Command as CommandConstructor} from "../../../Core/Structures/Command";
import { ICommandContext, IHyperion, CommandResponse } from "../../../types";



class Command extends CommandConstructor{
    constructor(){
        super({
            name: "command",
            module: "manager",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Enabled disables, or sets additional settings for a command",
            helpUsage: "{prefix}command [command name]\n{prefix}command [command name] [enable or disable]\n{prefix}command [command name] allowedroles [role]\n{prefix}command [command name] disabledroles [role]\n{prefix}command [command name] allowedchannels [channel]\n{prefix}command [command name] disabledchannels [channel]\n{prefix}command [command name] reset",
            helpUsageExample: "{prefix}command owoify enable\n{prefix}command owoify allowedroles developer\n{prefix}command owoify allowedchannels #commands\n{prefix}command owoify reset"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "Please specify a command.";}
        const input = ctx.args[0].toLowerCase();
        const command = Hyperion.commands.find(c => (c.name === input || c.aliases.includes(input)) && (!c.dev && !c.contrib && !c.internal && !c.support && !c.unlisted));
        if(!command){return "Im not sure what command that is.";}
        const commandStatus = await Hyperion.managers.guild.getCommandState(ctx.guild.id, command.name);
        if(!ctx.args[1]){
            const data = {
                embed: {
                    title: `Command Settings for ${command.name}`,
                    color: Hyperion.defaultColor,
                    description: `Enabled: ${commandStatus.enabled}\nAllowed Roles: ${commandStatus.allowedRoles.map(r => `<@&${r}>`).join(", ") || "None"}\nDisabled Roles: ${commandStatus.disabledRoles.map(r => `<@&${r}>`).join(", ") || "None"}\nAllowed Channels: ${commandStatus.allowedChannels.map(r => `<#${r}>`).join(", ") || "None"}\nDisabled Channels: ${commandStatus.disabledChannels.map(r => `<#${r}>`).join(", ") || "None"}`,
                    timestamp: new Date
                }
                
            };
            return data;
            
        }
        if(ctx.args[1].toLowerCase() === "enable"){
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, {enabled: true}, Hyperion.commands);
                return `Enabled ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "disable"){
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, {enabled: false}, Hyperion.commands);
                return `Disabled ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "allowedroles"){
            if(!ctx.args[2]){return "Please specify a role to add or remove";}
            const update = {allowedRoles: commandStatus.allowedRoles};
            const role = Hyperion.utils.resolveRole(ctx.args[2], ctx.guild.roles)?.id;
            if(!role){return "I couldnt find that role";}
            if(update.allowedRoles.includes(role)){
                const temp = update.allowedRoles.indexOf(role);
                update.allowedRoles.splice(temp);
            }else{
                update.allowedRoles.push(role);
            }
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, update, Hyperion.commands);
                return `Updated allowed roles for ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "disabledroles"){
            if(!ctx.args[2]){return "Please specify a role to add or remove";}
            const update = {disabledRoles: commandStatus.disabledRoles};
            const role = Hyperion.utils.resolveRole(ctx.args[2], ctx.guild.roles)?.id;
            if(!role){return "I couldnt find that role";}
            if(update.disabledRoles.includes(role)){
                const temp = update.disabledRoles.indexOf(role);
                update.disabledRoles.splice(temp);
            }else{
                update.disabledRoles.push(role);
            }
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, update, Hyperion.commands);
                return `Updated disabled roles for ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "allowedchannels"){
            if(!ctx.args[2]){return "Please specify a channel to add or remove";}
            const update = {allowedChannels: commandStatus.allowedChannels};
            const role = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[2])?.id;
            if(!role){return "I couldnt find that channel";}
            if(update.allowedChannels.includes(role)){
                const temp = update.allowedChannels.indexOf(role);
                update.allowedChannels.splice(temp);
            }else{
                update.allowedChannels.push(role);
            }
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, update, Hyperion.commands);
                return `Updated allowed channels for ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "disabledchannels"){
            if(!ctx.args[2]){return "Please specify a channel to add or remove";}
            const update = {disabledChannels: commandStatus.disabledChannels};
            const role = Hyperion.utils.resolveTextChannel(ctx.guild, ctx.msg, ctx.args[2])?.id;
            if(!role){return "I couldnt find that channel";}
            if(update.disabledChannels.includes(role)){
                const temp = update.disabledChannels.indexOf(role);
                update.disabledChannels.splice(temp);
            }else{
                update.disabledChannels.push(role);
            }
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, update, Hyperion.commands);
                return `Updated disabled channels for ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        if(ctx.args[1].toLowerCase() === "reset"){
            try{
                await Hyperion.managers.guild.updateCommands(ctx.guild.id, command.name, {enabled: true, allowedRoles: [], allowedChannels: [], disabledRoles: [], disabledChannels: []}, Hyperion.commands);
                return `Reset command settings for ${command.name}`;
            }catch(err){
                return err.message;
            }
        }
        return "You didnt give a valid option, check help for more info";
        
    }
}
export default Command;