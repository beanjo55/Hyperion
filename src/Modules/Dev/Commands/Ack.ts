import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, AckInterface} from "../../../types";

class Ack extends Command{
    constructor(){
        super({
            name: "ack",
            module: "dev",
            helpDetail: "Internal ack management",
            helpUsage: "Dont worry abounot reat it",
            noExample: true,
            dev: true,
            unlisted: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        if(!ctx.args[0] || !ctx.args[1]){return "<a:happykitty:734450859026546699>";}
        const user = ctx.args[0];
        const ackName = ctx.args[1];
        const userAcks = await Hyperion.managers.user.getAcks(user).catch((err) => {return err.message;});
        if(ackName === "custom"){
            try{
                await Hyperion.managers.user.setAcks(user, {custom: ctx.args.slice(2).join(" ")});
                return "Success";
            }catch(err){
                return err.message;
            }
        }
        if(userAcks[ackName.toLowerCase()] === undefined){return "<a:happykitty:734450859026546699>";}
        try{
            const update: Partial<AckInterface> = {};
            update[ackName.toLowerCase()] = !userAcks[ackName.toLowerCase()];
            await Hyperion.managers.user.setAcks(user, update);
            return "Success";
        }catch(err){
            return err.messahe;
        }
    }
}
export default Ack;