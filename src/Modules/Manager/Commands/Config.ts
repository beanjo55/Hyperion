import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {HyperionInterface, CommandContext, ConfigOp, GuildConfig} from "../../../types";
import {configurableModules} from "../Module/ConfigHelper";
// eslint-disable-next-line no-unused-vars
import { Module, ConfigKey } from "../../../Core/Structures/Module";
import {inspect} from "util";
import { GuildChannel } from "eris";


const opmap = ["get", "set", "add", "remove", "clear"];
const gets = ["get", "show", "view"];
const dels = ["del", "remove", "delete"];
const clears = ["clear", "reset"];

class Config extends Command{
    constructor(){
        super({
            name: "config",
            module: "manager",
            alwaysEnabled: true,
            userperms: ["manager"],

            helpDetail: "Configures bot settings for the server",
            helpUsage: "{prefix}config - shows configurable modules\n{prefix}config [module] - shows settings for the module\n{prefix}config [module] [setting] - shows operations possible for that setting\n{prefix}config [module] [setting] [operation] [value] - changes a setting",
            helpUsageExample: "{prefix}config\n{prefix}config starboard\n{prefix}config starboard starchannel\n{prefix}config starboard starchannel set #starboard"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(!ctx.args[0]){
            return this.listModules(ctx, Hyperion);
        }
        if(ctx.args[0] && !ctx.args[1]){
            let mod = this.validateModule(Hyperion, ctx.args[0]);
            if(typeof(mod) === "string"){return mod;}
            return this.listKeys(Hyperion, mod);
        }

        if((ctx.args[0] && ctx.args[1]) && !ctx.args[2]){
            let mod = this.validateModule(Hyperion, ctx.args[0]);
            if(typeof(mod) === "string"){return mod;}
            let key = this.validateKey(mod, ctx.args[1]);
            if(typeof(key) === "string"){return key;}
            return this.listOps(Hyperion, key);
        }

        if((ctx.args[0] && ctx.args[1] && ctx.args[2]) && !ctx.args[3]){
            let mod = this.validateModule(Hyperion, ctx.args[0]);
            if(typeof(mod) === "string"){return mod;}
            let key = this.validateKey(mod, ctx.args[1]);
            if(typeof(key) === "string"){return key;}
            let op = this.validateOp(ctx.args[2]);
            if(typeof(op) === "string"){return op;}
            if(op === 0){
                return await this.getVal(ctx, Hyperion, mod, key);
            }
            if(op === 4){
                return await this.reset(ctx, Hyperion, mod, key);
            }
            return this.listType(key);
        }

        let mod = this.validateModule(Hyperion, ctx.args[0]);
        if(typeof(mod) === "string"){return mod;}
        let key = this.validateKey(mod, ctx.args[1]);
        if(typeof(key) === "string"){return key;}
        let op = this.validateOp(ctx.args[2]);
        if(typeof(op) === "string"){return op;}
        return await this.doOp(ctx, Hyperion, mod, key, op, ctx.args.slice(3).join(" "));
    }

    listModules(ctx: CommandContext, Hyperion: HyperionInterface){
        const confMods = configurableModules(Hyperion.modules).map((m: Module) => m.friendlyName);

        const data = {
            embed: {
                title: "Hyperion Configuration",
                color: Hyperion.defaultColor,
                description: `To see the settings for a module, run ${ctx.guildConfig.prefix}config [Module Name]\nThe modules that can be configured are listed below.\n\`\`\`${confMods.join(" \n")}\`\`\``,
                timestamp: new Date
            }
        };
        return data;
    }

    listKeys(Hyperion: HyperionInterface, module: Module){
        if(!module.configKeys){return "The module is marked as configurable, but has no keys to configure. Please contact a developer";}
        let output: Array<string> = module.configKeys.map((ck: ConfigKey) => `${ck.id}: ${ck.description}`);
        const data = {
            embed: {
                title: `${module.friendlyName} Configuration`,
                color: Hyperion.defaultColor,
                timestamp: new Date,
                description: `The Configurable settings for ${module.friendlyName} are:\n\`\`\`x1\n${output.join("\n\n")}\`\`\``
            }
        };
        return data;
    }

    listOps(Hyperion: HyperionInterface, key: ConfigKey){
        let output: Array<string> = [];
        key.ops.forEach((op: number) => {
            output.push(opmap[op]);
        });
        const data = {
            embed: {
                title: `${key.friendlyName} Configuration`,
                color: Hyperion.defaultColor,
                timestamp: new Date,
                description: `Valid operations for ${key.friendlyName} are:\n\`\`\`\n${output.join((", "))}\`\`\``
            }
        };
        return data;
    }

    listType(key: ConfigKey){
        if(!key){return "How did you get here? key is undefined";}
        if(key.array){
            return `${key.friendlyName} is an array of ${key.dataType}s`;
        }
        return `${key.friendlyName} is a ${key.dataType}`;
    }

    async doOp(ctx: CommandContext, Hyperion: HyperionInterface, module: Module, key: ConfigKey, op: number, value: string){
        if(!key.ops.includes(op)){return "That operation is not valid for this key";}
        let guilddata = await Hyperion.managers.guild.getConfig(ctx.guild.id);
        if(!guilddata){return "There was an error getting the guild data";}

        if(op === 1){
            let data: any = {};
            data[key.id] = value;
            if(key.dataType === "number"){
                let num = Number(value);
                if(isNaN(num)){return "That isnt a valid number";}
                data[key.id] = num;
            }
            if(key.dataType === "channel"){
                let chan = ctx.guild.channels.get(value)?.id;
                if(!chan && ctx.msg.channelMentions && ctx.msg.channelMentions[0]){
                    chan = ctx.msg.channelMentions[0];
                }
                if(!chan){
                    chan = ctx.guild.channels.find((c: GuildChannel) => (c.type === 0 || c.type === 5) && c.name.toLowerCase().startsWith(value.toLowerCase()))?.id;
                }
                if(!chan){return "I cant find that channel in the guild, try a channel mention or the channel id";}
                data[key.id] = chan;
            }
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
            }catch(err){
                Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
                return "there was an error updating the config";
            }
            return "Success!";
        }

        if(op === 2){
            let old = (guilddata as any)[module.name][key.id];
            if(!old || !old[0]){
                let data: any = {};
                data[key.id] = [value];
                if(key.dataType === "channel"){
                    let chan = ctx.guild.channels.get(value)?.id;
                    if(!chan && ctx.msg.channelMentions && ctx.msg.channelMentions[0]){
                        chan = ctx.msg.channelMentions[0];
                    }
                    if(!chan){
                        chan = ctx.guild.channels.find((c: GuildChannel) => (c.type === 0 || c.type === 5) && c.name.toLowerCase().startsWith(value.toLowerCase()))?.id;
                    }
                    if(!chan){return "I cant find that channel in the guild, try a channel mention or the channel id";}
                    data[key.id] = [chan];
                }
                try{
                    await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
                }catch(err){
                    Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
                    return "there was an error updating the config";
                }
                return "Success!";
            }
            if(old.includes(value)){return "That value is already added for this setting";}
            if(key.dataType === "channel"){
                let chan = ctx.guild.channels.get(value)?.id;
                if(!chan && ctx.msg.channelMentions && ctx.msg.channelMentions[0]){
                    chan = ctx.msg.channelMentions[0];
                }
                if(!chan){
                    chan = ctx.guild.channels.find((c: GuildChannel) => (c.type === 0 || c.type === 5) && c.name.toLowerCase().startsWith(value.toLowerCase()))?.id;
                }
                if(!chan){return "I cant find that channel in the guild, try a channel mention or the channel id";}
                old.push(chan);
            }else{
                old.push(value);
            }
            let data: any = {};
            data[key.id] = old;
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
            }catch(err){
                Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
                return "there was an error updating the config";
            }
            return "Success!";
        }

        if(op === 3){
            let old = (guilddata as any)[module.name][key.id];
            if(!old || !old[0]){return "No values were set, so there is nothing to remove";}
            if(key.dataType === "channel"){
                let chan = ctx.guild.channels.get(value)?.id;
                if(!chan && ctx.msg.channelMentions && ctx.msg.channelMentions[0]){
                    chan = ctx.msg.channelMentions[0];
                }
                if(!chan){
                    chan = ctx.guild.channels.find((c: GuildChannel) => (c.type === 0 || c.type === 5) && c.name.toLowerCase().startsWith(value.toLowerCase()))?.id;
                }
                if(!chan){return "I cant find that channel in the guild, try a channel mention or the channel id";}
                value = chan;
            }
            if(!old.includes(value)){return "That value isnt part of that key";}
            let newarr: Array<any> = [];
            old.forEach((val: any) => {
                if(val !== value){newarr.push(val);}
            });
            let data: any = {};
            data[key.id] = newarr;

            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
            }catch(err){
                Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
                return "there was an error updating the config";
            }
            return "Success!";
        }
    }

    async getVal(ctx: CommandContext, Hyperion: HyperionInterface, module: Module, key: ConfigKey){
        let data: GuildConfig = await Hyperion.managers.guild.getConfig(ctx.guild.id);
        if(!data){return "There was an error getting the guild data";}
        let out = (data as any)[module.name][key.id];
        if(!out){return "This value hasnt been set";}
        const output = {
            embed: {
                color: Hyperion.defaultColor,
                timestamp: new Date,
                title: `Value for ${key.friendlyName}`,
                description: `\`\`\`\n${inspect(out)}\`\`\``
            }
        };
        if(key.dataType === "channel" && !key.array){
            output.embed.description = `<#${out}>`;
        }
        if(key.dataType === "channel" && key.array){
            let tmp: Array<string> = [];
            out.forEach((x: string) => {
                tmp.push(`<#${x}>`);
            });
            output.embed.description = tmp.join("\n");
        }
        return output;
    }

    async reset(ctx: CommandContext, Hyperion: HyperionInterface, module: Module, key: ConfigKey){
        if(key.array){
            let data: any = {};
            data[key.id] = [];
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
            }catch(err){
                Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
                return "there was an error updating the config";
            }
            return "Success!";
        }
        let data: any = {};
        data[key.id] = key.default;
        try{
            Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, module.name, data);
        }catch(err){
            Hyperion.logger.error("Hyperion", "Config", `Error updating config for ${ctx.guild.id}, command ${ctx.msg.content}, error: ${inspect(err)}`);
            return "there was an error updating the config";
        }
        return "Success!";
    }



    validateModule(Hyperion: HyperionInterface, input: string): string | Module{
        if(!configurableModules(Hyperion.modules).map((m: Module) => m.name).includes(input.toLowerCase())){
            return "I couldnt find a configurable module by that name";
        }
        const module: Module | undefined = Hyperion.modules.get(input.toLowerCase());
        if(!module){return "I couldnt find a module by that name";}
        return module;
    }

    validateKey(module: Module, input: string): string | ConfigKey{
        if(!module){return "Module is undefined, how did you get here <:borking:694988763226701884>";}
        if(!module.configKeys){return "The module has no keys, how did you get here <:borking:694988763226701884>";}
        let key = module.configKeys.find((ck: ConfigKey) => ck.id.toLowerCase() === input.toLowerCase());
        if(!key){return "I couldnt find a key by that name in that module";}
        return key;
    }

    validateOp(input: string){
        input = input.toLowerCase();
        if(input === "set"){return 1;}
        if(input === "add"){return 2;}
        if(gets.includes(input)){return 0;}
        if(dels.includes(input)){return 3;}
        if(clears.includes(input)){return 4;}
        return "I dont understand that operation";
    }

}
export default Config;