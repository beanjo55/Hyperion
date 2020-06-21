import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";

class Reload extends Command{
    constructor(){
        super({
            name: "reload",
            module: "dev",
            aliases: ["rl"],
            helpDetail: "Dont worry about it",
            helpUsage: "Dont worry about it",
            noExample: true,
            dev: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0]){return "Specify what type of thing to reload";}
        if(!ctx.args[1]){return "Specify a thing to reload";}
        if(ctx.args[0] === "command"){
            try{
                Hyperion.reloadCommand(ctx.args[1]);
                return "Success";
            }catch(err){
                return `${err}`;
            }
        }
        if(ctx.args[0] === "module"){
            try{
                Hyperion.reloadMod(ctx.args[1]);
                return "Success";
            }catch(err){
                return `${err}`;
            }
        }
        if(ctx.args[0] === "event"){
            try{
                Hyperion.reloadEvent(ctx.args[1]);
                return "Success";
            }catch(err){
                return `${err}`;
            }
        }
        if(ctx.args[0] === "newcommand"){
            try{
                Hyperion.loadCommand(ctx.args[1], ctx.args[2]);
                return "Success";
            }catch(err){
                return `${err}`;
            }
        }
        return "Specify one of the valid options";
    }
}
export default Reload;