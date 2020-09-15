import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, MixedResponse, CommandResponse} from "../../../types";
import {default as levels} from "../Levels";

class Exprole extends Command{
    constructor(){
        super({
            name: "exprole",
            module: "levels",
            userperms: ["manager"],

            helpDetail: "Manages exp roles in the server",
            helpUsage: "{prefix}exprole add [exp amount] [role]\n{prefix}exprole remove [exp amount]",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext<levels>, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0] || ctx.args[0].toLowerCase() === "list"){
            const config = await ctx.module.getLevelsConfig(ctx.guild.id);
            const names = Object.getOwnPropertyNames(config.expRoles);
            const arr: Array<{exp: number; role: string}> = [];
            names.forEach(name => {
                arr.push({exp: Number(name), role: ctx.guild.roles.get(config.expRoles[name].role)?.name ?? "Deleted Role"});
            });
            arr.sort((a, b) => a.exp - b.exp);
            const newArr = arr.map(ele => `${ele.exp} - ${ele.role}`);
            return {
                embed: {
                    title: `Exp Roles for ${ctx.guild.name}`,
                    color: Hyperion.colors.blue,
                    timestamp: new Date,
                    description: `\`\`\`xl\n${newArr.length === 0 ? "None" : newArr.join("\n")}\n\`\`\``
                }
            };
        }

        if(ctx.args[0].toLowerCase() === "add"){
            if(!ctx.args[1]){return {status: "error", response: "please specify an exp amount"};}
            if(!ctx.args[2]){return {status: "error", response: "please specify a role"};}
            const expNum = Number(ctx.args[1]);
            if(isNaN(expNum) || expNum <= 0){return {status: "neutral", response: "Please give a number greater than 0 for the exp amount"};}
            const role = Hyperion.utils.resolveRole(ctx.args[2], ctx.guild.roles);
            if(!role){return {status: "neutral", response: "I couldnt find that role"};}
            const config = await ctx.module.getLevelsConfig(ctx.guild.id);
            if(config.expRoles[expNum] !== undefined){return {status: "error", response: "That exp value already has a role linked"};}
            config.expRoles[expNum] = {role: role.id, global: false, exp: expNum};
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "levels", config);
                return {status: "fancySuccess", response: "Added exp role!"};
            }catch(err){
                return {status: "error", response: "Failed to add Exp role" + err.message};
            }
        }
        if(ctx.args[0].toLowerCase() === "remove"){
            if(!ctx.args[1]){return {status: "error", response: "please specify an exp amount"};}
            const expNum = Number(ctx.args[1]);
            if(isNaN(expNum) || expNum <= 0){return {status: "neutral", response: "Please give a number greater than 0 for the exp amount"};}
            const config = await ctx.module.getLevelsConfig(ctx.guild.id);
            if(config.expRoles[expNum] === undefined){return {status: "error", response: "That exp value doesnt have a role linked"};}
            delete config.expRoles[expNum];
            try{
                await Hyperion.managers.guild.updateModuleConfig(ctx.guild.id, "levels", config);
                return {status: "fancySuccess", response: "Removed exp role!"};
            }catch(err){
                return {status: "error", response: "Failed to remove Exp role" + err.message};
            }
        }
        return "I didnt understand that option, try add or remove";
    }
}

export default Exprole;