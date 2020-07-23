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
        if(!ctx.args[0]){return "Specify something to restart";}
        if(ctx.args[0].toLowerCase() === "all"){
            if(ctx.args[1] && ctx.args[1].toLowerCase() === "hard"){exec("pm2 restart 0", undefined); return "Restarting";}
            Hyperion.ipc.restartAllClusters();
            return "Restarting all clusters";
        }
        if(ctx.args[0].toLowerCase() === "cluster"){
            if(!ctx.args[1]){return "specify a cluster to restart";}
            const clusterNum = Number(ctx.args[1]);
            if(isNaN(clusterNum) || clusterNum < 0){return "Please specify a valid cluster";}
            let hard = false;
            if(ctx.args[2] && ctx.args[2].toLowerCase() === "hard"){hard = true;}
            Hyperion.ipc.restartCluster(clusterNum, hard);
            return `Restarting cluster ${clusterNum}`;
        }
        if(ctx.args[0] === "service"){
            if(!ctx.args[1]){return "specify a service to restart";}
            Hyperion.ipc.restartService(ctx.args[1].toLowerCase());
            return `Restarting service ${ctx.args[1]}`;
        }
    }
}
export default Restart;