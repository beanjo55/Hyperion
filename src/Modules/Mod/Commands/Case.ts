import {Command} from "../../../Core/Structures/Command";
import {IHyperion, ICommandContext, EmbedResponse} from "../../../types";
import {default as Mod} from "../Mod";
import { User } from "eris";


class Case extends Command{
    constructor(){
        super({
            name: "case",
            module: "mod",
            userperms: ["mod"],
            helpDetail: "Brings up info about a particular case",
            helpUsage: "{prefix}case [case number]",
            helpUsageExample: "{prefix}case 1"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | EmbedResponse>{
        ctx.module = (ctx.module as Mod);
        if(!ctx.args[0]){return "Please specify a case number";}
        const caseNum = Number(ctx.args[0]);
        if(isNaN(caseNum) || caseNum < 1){return "Please enter a valid case number";}
        const caseData = await Hyperion.managers.modlog.getCaseByCasenumber(ctx.guild.id, caseNum);
        if(!caseData){return "That case was not found";}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const user = (Hyperion.client.users.get(caseData.user) ?? await Hyperion.client.getRESTUser(caseData.user).catch(() => {})) as User;
        return (ctx.module as Mod).makeEmbed((ctx.module as Mod).logToContext(caseData, Hyperion), user);

    }
}
export default Case;