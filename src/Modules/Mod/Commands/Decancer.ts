import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import {default as limax} from "limax";
import {default as unorm} from "unorm";

class Decancer extends Command{
    constructor(){
        super({
            name: "decancer",
            module: "mod",
            userperms: ["mod"],
            cooldownTime: 5000,
            helpDetail: "Makes a user's name readable",
            helpUsage: "{prefix}decancer [user]",
            helpUsageExample: "{prefix}decancer bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "Cache failure, could not find bot user";}
        if(!bot.permission.has("manageNicknames")){return "I need permissions to manage nicknames to decancer someone's name";}
        if(!ctx.args[0]){return "Please specify a user";}
        const target = Hyperion.utils.strictResolver(ctx.args[0], ctx.guild.members);
        if(!target){return "Im not sure who that is, try an ID or mention";}
        if(!ctx.module.canModerate(Hyperion, target, bot, ctx.guild)){return "I cant manage that user";}
        const text = target.nick ?? target.username;
        const cleaned = this.decancer(text);
        if(cleaned === text){return "The decancered result was the same";}
        try{
            await target.edit({
                nick: cleaned
            }, "Hyperion Decancer");
            return "Successfully changed nickname!";
        }catch{
            return "Failed to change nickname";
        }
    }

    decancer(text: string): string{
        text = unorm.nfkd(text);
        text = limax(text, {
            replacement: " ",
            tone: false,
            separateNumbers: false,
            maintainCase: true,
            custom: [".", ",", " ", "!", "'", "\"", "?"]
        });
        return text;
    }
}
export default Decancer;