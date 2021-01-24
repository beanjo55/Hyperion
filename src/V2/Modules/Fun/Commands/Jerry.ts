/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
class Jerry extends Command{
    constructor(){
        super({
            name: "jerry",
            module: "fun",
            helpDetail: "Send Jerry.",
            helpUsage: "{prefix}jerry",
            noExample: true,
            friend: true,
            unlisted: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(ctx.user.id === "344954369285947392" || ctx.user.id === "489989456175300618" || ctx.user.id === "253233185800847361"){
            return "<@344954369285947392>\n<@489989456175300618>\nhttps://cdn.discordapp.com/attachments/448682951258144799/715698613430255687/video0_5.mp4";
        }
        return "https://cdn.discordapp.com/attachments/448682951258144799/715698613430255687/video0_5.mp4";
    }
}
export default Jerry;