import { GuilduserType, UserType } from "../../../../main";
import {Command} from "../../../Structures/Command";
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

    // eslint-disable-next-line complexity
    async execute(ctx: ICommandContext, Hyperion: IHyperion): CommandResponse{
        const global = ctx.content.toLowerCase().endsWith("-g");
        let pageNum = 0;
        if(ctx.args[0] && ctx.args[0].toLowerCase() !== "-g"){
            const temp = Number(ctx.args[0]);
            if(isNaN(temp) || temp < 0){return {status: "neutral", response: "Invalid page provided"};}
            pageNum = temp;
        }
        let list = [];
        if(!global){
            list = await Hyperion.managers.guilduser.raw().find({guild: ctx.guild.id}).sort({exp: -1, user: 1}).skip(20*pageNum).limit(20).lean<GuilduserType>().exec();
        } else{
            list = await Hyperion.managers.user.raw().find().sort({exp: -1, user: 1}).skip(20*pageNum).limit(20).lean<UserType>().exec();
        }
        if(!list || list.length === 0){return {status: "error", response: "That page doesnt exist"};}
        const users = [];
        let maxLength = 0;
        for(const user of list){
            if(user.exp === undefined || user.exp === 0){continue;}
            if(user.exp.toString().length > maxLength){
                maxLength = user.exp.toString().length;
            }
        }
        for(const user of list){
            const userObjA = Hyperion.client.users.get(user.user);
            let userObj;
            if(!userObjA){
                if(global){
                    userObj = await Hyperion.client.getRESTUser(user.user).catch(() => undefined);
                    if(userObj){Hyperion.client.users.add(userObj);}
                }else{
                    const temp = await ctx.guild.fetchMembers({userIDs: [user.user]});
                    if(temp && temp.length !== 0){userObj = temp[0];}
                }
            }else{
                userObj = userObjA;
            }
            const name = userObj ? `${userObj.username}#${userObj.discriminator}` : `${user.user} (User left the server)`;
            if(user.exp === undefined || user.exp === 0){continue;}
            let EXP = "EXP: " + user.exp.toString();
            const length = user.exp.toString().length;
            if(length < maxLength){
                let diff = maxLength - length;
                while(diff !== 0){
                    EXP += " ";
                    diff--;
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            users.push(`#${(20*pageNum) + list.indexOf(user as any) + 1}: ${pageNum === 0 && list.indexOf(user as any) < 9 ? " " : ""}${EXP} - ${name}\n`);
        }
        const embed: EmbedResponse = {
            embed: {
                title: global ? "Global Leaderboard" : `Leaderboard for ${ctx.guild.name}`,
                color: Hyperion.colors.blue,
                timestamp: new Date,
                description: `\`\`\`xl\n${users.join("\n")}\`\`\``
            }
        };
        if(users.length === 0){embed.embed.description = "There is no ranking data for this server";}
        return embed;

    }
}
export default Leaderboard;