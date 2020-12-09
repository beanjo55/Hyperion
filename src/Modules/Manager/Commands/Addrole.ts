import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";


class Addrole extends Command{
    constructor(){
        super({
            name: "addrole",
            module: "manager",
            userperms: ["manager"],
            cooldownTime: 6000,
            botperms: ["manageRoles"],

            helpDetail: "Makes a new role.",
            helpUsage: "{prefix}addrole rolename, [optional color], [optional hoist]",
            helpUsageExample: "{prefix}addrole developers\n{prefix}addrole developers, #6597f9\n{prefix}addrole developers, #6597f9, yes"
        });
    }

    // eslint-disable-next-line complexity
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "A cache error occured!";}
        if(!bot.permission.has("manageRoles")){return "I need the `Manage Roles` permission to create roles.";}
        const input = ctx.args.join(" ");
        if(!input.includes(",")){
            try{
                await ctx.guild.createRole({
                    name: input
                });
            }catch(err){
                Hyperion.logger.warn("Hyperion", `Failed to create role, ${ctx.msg.content}, error: ${err}`, "Addrole");
                return "There was an error creating the role.";
            }
            return "Successfully made the role!";
        }
        const first = input.indexOf(",");
        const second = input.lastIndexOf(",");
        if(first === second){
            const sub = input.substring(first+1).trim();
            let color;
            if(sub.startsWith("#")){
                color = parseInt(sub.substring(1), 16);
            }
            if(sub.startsWith("0x")){
                color = parseInt(sub.substring(1), 16);
            }
            if(!isNaN(Number(sub))){
                if(Number(sub) > 16777215 || Number(sub) < 0){return "Invalid color provided.";}
                color = Number(sub);
            }
            if(color === undefined){return "Invalid color provided.";}
            try{
                await ctx.guild.createRole({
                    name: input.substring(0, first),
                    color: color
                });
            }catch(err){
                Hyperion.logger.warn("Hyperion", `Failed to create role, ${ctx.msg.content}, error: ${err}`, "Addrole");
                return "There was an error creating the role!";
            }
            return "Successfully made the role!";
        }

        const sub = input.substring(first+1, second).trim();
        let color;
        if(sub.startsWith("#")){
            color = parseInt(sub.substring(1), 16);
        }
        if(sub.startsWith("0x")){
            color = parseInt(sub.substring(1), 16);
        }
        if(!isNaN(Number(sub))){
            if(Number(sub) > 16777215 || Number(sub) < 0){return "Invalid color provided.";}
            color = Number(sub);
        }else{
            if(!color){
                color = parseInt(sub, 16);
            }
        }
        if(color === undefined){return "Invalid color provided.";}

        const subHoist = input.substring(second+1).trim().toLowerCase();
        let hoist;
        if(subHoist === "yes" || subHoist === "true"){hoist = true;}
        if(subHoist === "false" || subHoist === "no"){hoist = false;}
        if(!hoist){return "Invalid argument provided, try `yes` or `no`.";}
        try{
            await ctx.guild.createRole({
                name: input.substring(0, first),
                color: color,
                hoist: hoist
            });
        }catch(err){
            Hyperion.logger.warn("Hyperion", `Failed to create role, ${ctx.msg.content}, error: ${err}`, "Addrole");
            return "There was an error creating the role!";
        }
        return "Successfully made the role!";
    }
}
export default Addrole;
