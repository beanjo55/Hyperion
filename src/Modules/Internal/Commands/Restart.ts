/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, CommandResponse} from "../../../types";
import {exec} from "child_process";

class Restart extends Command{
    constructor(){
        super({
            name: "restart",
            module: "internal",
            aliases: ["r"],
            internal: true,
            alwaysEnabled: true,
            admin: true,

            helpDetail: "Restarts the bot",
            helpUsage: "{prefix}restart",
            noExample: true
        });
    }


    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<void | string>{
        if(!ctx.args[0]){return "specify a cluster to restart";}
        const clusterNum = Number(ctx.args[0]);
        if(isNaN(clusterNum) || clusterNum < 0){return "Please specify a valid cluster";}
        Hyperion.restartCluster(clusterNum);
        return `Restarting cluster ${clusterNum}`;
        
    }
}
export default Restart;