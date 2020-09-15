import {Command} from "../../../Core/Structures/Command";
import { IGuildUser } from "../../../MongoDB/Guilduser";
import {IHyperion, ICommandContext, CommandResponse, EmbedResponse} from "../../../types";

class Leaderboard extends Command{
    constructor(){
        super({
            name: "leaderboard",
            aliases: ["lb", "top"],
            module: "levels", 

            helpDetail: "Shows an exp leaderboard for the server",
            helpUsage: "{prefix}leaderboard <Page Number>",
            noExample: true
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        let pageNum = 0;
        if(ctx.args[0]){
            const temp = Number(ctx.args[0]);
            if(isNaN(temp) || temp < 0){return {status: "neutral", response: "Invalid page provided"};}
            pageNum = temp;
        }
        const list = await Hyperion.models.guilduser.find({guild: ctx.guild.id}).sort({exp: -1}).skip(20*pageNum).limit(20).lean<IGuildUser>().exec();
        if(!list || list.length === 0){return {status: "error", response: "That page doesnt exist"};}
        const users = [];
        let maxLength = 0;
        for(const user of list){if(user.exp.toString().length > maxLength){maxLength = user.exp.toString().length;}}
        for(const user of list){
            const userObjA = Hyperion.client.users.get(user.user);
            let userObj;
            if(!userObjA){
                const temp = await ctx.guild.fetchMembers({userIDs: [user.user]});
                if(temp && temp.length !== 0){userObj = temp[0];}
            }else{
                userObj = userObjA;
            }
            const name = userObj ? `${userObj.username}#${userObj.discriminator}` : `${user.user} (User left the server)`;
            let EXP = "EXP: " + user.exp.toString();
            const length = user.exp.toString().length;
            if(length < maxLength){
                let diff = maxLength - length;
                while(diff !== 0){
                    EXP += " ";
                    diff--;
                }
            }
            users.push(`#${(20*pageNum) + list.indexOf(user) + 1}: ${list.indexOf(user) < 9 ? " " : ""}${EXP} - ${name}\n`);
        }
        const embed: EmbedResponse = {
            embed: {
                title: `Leaderboard for ${ctx.guild.name}`,
                color: Hyperion.colors.blue,
                timestamp: new Date,
                description: `\`\`\`xl\n${users.join("\n")}\`\`\``
            }
        };
        return embed;

    }
}
export default Leaderboard;