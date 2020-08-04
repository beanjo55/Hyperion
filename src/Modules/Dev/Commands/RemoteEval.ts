import { Embed } from "eris";
import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";

class RemoteEval extends Command{
    constructor(){
        super({
            name: "remoteeval",
            aliases: ["re"],
            dev: true, 
            unlisted: true,
            module: "dev",
            alwaysEnabled: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        if(!ctx.args[0]){return "Please specify a cluster";}
        const clusterNum = Number(ctx.args[0]);
        if(isNaN(clusterNum) || clusterNum < 0){return "Please specify a valid cluster";}
        Hyperion.ipc.sendTo(clusterNum, "eval", {code: ctx.args.slice(1).join(" "), from: Hyperion.clusterID});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Hyperion.ipc.register("evalResponse", async (message: any) => {
            Hyperion.ipc.unregister("evalResponse");
            if(message.error){ctx.channel.createMessage(this.evalerror(message.msg.result, Hyperion));}
            ctx.channel.createMessage(await this.evalresult(ctx, message.msg.result, Hyperion));
        });
        return "Assuming direct control";
    }

    clean(text: string, Hyperion: IHyperion): string{
        if (typeof(text) === "string"){
            return Hyperion.redact(text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)));
        }else{
            return text;
        }
    }

    async evalresult(ctx: ICommandContext, result: string, Hyperion: IHyperion): Promise<string | {embed: Partial<Embed>}>{
        const output = this.clean(result, Hyperion);
        if(output.length > 1990){
            console.log(output);
            return "The output was too long, it was sent to the console log";
        }
        const data ={
            embed: {
                author: { name: "Eval Results", icon_url: ctx.user.avatarURL },
                description: "```js\n" + output + "```",
                color: Hyperion.colors.default,
                timestamp: new Date()
            }
        };
        return data;
    }

    evalerror(result: string, Hyperion: IHyperion): string{
        return "`ERROR`\n```xl\n" + this.clean(result, Hyperion) + "```";
    }
}
export default RemoteEval;