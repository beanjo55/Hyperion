/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-empty-function */
import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext} from "../../../types";
import { Message } from "eris";

class Clean extends Command{
    constructor(){
        super({
            name: "clean",
            module: "mod",
            userperms: ["mod"],
            aliases: ["c"],
            helpDetail: "Cleans up responses from Hyperion, limit 100 messages back",
            helpUsage: "{prefix}clean [optional number of messages to clean]",
            noExample: true,
            selfResponse: true,
            botperms: ["manageMessages", "readMessageHistory"]
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<void>{
        
        let limit = 100;
        if(ctx.args[0]){
            const num = Number(ctx.args[0]);
            if(isNaN(num) || num > 100 || num < 1){return;}
            limit = num;
        }
        ctx.channel.getMessages(100).then(messages => {
            const delList: Array<Message> = [];
            if(!messages){throw new Error("error getting messages");}
            for (const msg of messages){
                if(limit === 0){break;}
                if(msg.author.id === Hyperion.client.user.id){
                    delList.push(msg);
                    limit--;
                }
            }
            return Promise.resolve(delList);
        }).then(delList => {
            if(delList.length === 1){return delList[0].delete();}
            return ctx.channel.deleteMessages(delList.map(m => m.id), "Hyperion clean");
        }).then(() => {}, () => {}).then(async () => {
            try{
                await ctx.msg.delete();
                Hyperion.redis.set(`Deleted:${ctx.msg.id}`, 1, "EX", 5);
            }catch{}
        });
    }
}
export default Clean;