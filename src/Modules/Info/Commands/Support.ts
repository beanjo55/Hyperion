import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Embed } from "eris";

class Support extends Command{
    constructor(){
        super({
            name: "support",
            module: "info",

            helpDetail: "Shows the support server invite, with the option to paste the raw invite in chat instead of embedding the link.",
            helpUsage: "{prefix}support\n{prefix}support raw",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        if(ctx.args[0] && ctx.args[0].toLowerCase() === "raw"){
            return "https://discord.gg/Vd8vmBD";
        }else{
            return {
                embed: {
                    color: Hyperion.defaultColor,
                    timestamp: new Date,
                    title: "Hyperion Support Server",
                    description: "[Join the support server here!](https://discord.gg/Vd8vmBD)"
                }
            };
        }
    }
}

export default Support;