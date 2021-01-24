import {Command} from "../../../Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";


class Nick extends Command{
    constructor(){
        super({
            name: "nick",
            module: "manager",
            aliases: ["nickname"],
            userperms: ["manager"],
            cooldownTime: 10000,
            botperms: ["changeNickname"],
            helpDetail: "Changes the bot nickname in the server.",
            helpUsage: "{prefix}nick [new nickname]",
            helpUsageExample: "{prefix}nick Harbringer"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string>{
        const bot = ctx.guild.members.get(Hyperion.client.user.id);
        if(!bot){return "A cache error occured!";}
        if(!bot.permissions.has("changeNickname")){return "I don't have permissions to change my own nickname!";}
        if(!ctx.args[0]){
            try{
                await Hyperion.client.editNickname(ctx.guild.id, Hyperion.client.user.username);
            }catch(err){
                return "There was an error trying to change my nickname!";
            }
            return "Successfully reset my nickname!";
        }
        try{
            await Hyperion.client.editNickname(ctx.guild.id, ctx.args.join(" "));
        }catch(err){
            return "There was an error trying to change my nickname!";
        }
        return "Success!";
    }
}
export default Nick;
