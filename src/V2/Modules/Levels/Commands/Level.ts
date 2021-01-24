import { GuilduserType } from "../../../../main";
import {Command} from "../../../Structures/Command";

import {IHyperion, ICommandContext, MixedResponse, EmbedResponse} from "../../../types";

class Level extends Command{
    constructor(){
        super({
            name: "level",
            module: "levels",
            aliases: ["lvl", "rank"],

            helpDetail: "checks your level or someone elses",
            helpUsage: "{prefix}level\n{prefix}level [user]",
            noExample: true
        });
    }


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<MixedResponse>{
        let target = ctx.member;
        if(ctx.args[0]){
            const temptarget = await Hyperion.utils.op8(ctx.args[0], ctx.guild);
            if(!temptarget){return "I couldnt find that user.";}
            target = temptarget;
        }
        const global = await Hyperion.managers.user.getUserConfig(target.id);
        const server = await Hyperion.managers.guilduser.getUserConfig(target.id, ctx.guild.id);
        const userDataPre = await Hyperion.managers.guilduser.raw().findOne({guild: ctx.guild.id, user: target.id}).lean<GuilduserType>().exec();
        let serverRankField = {name: "\u200b", value: "\u200b", inline: true};
        if(userDataPre){
            const userData = (userDataPre as unknown as Array<GuilduserType>).length !== undefined ? (userDataPre as unknown as Array<GuilduserType>)[0] : userDataPre as GuilduserType;
            const list = await Hyperion.managers.guilduser.raw().find({guild: ctx.guild.id}).sort({exp: -1, user: 1}).gte("exp", userData.exp - 1).lean<GuilduserType>().exec();
            const pos = list.map(us => us.user).indexOf(userData.user);
            serverRankField = {name: "Server Rank", value: `#${pos+1}`, inline: true};
        }

        const data: EmbedResponse = {
            embed: {
                color: Hyperion.colors.blue,
                title: `Level data for ${target.username}#${target.discriminator}`,
                thumbnail: {url: target.avatarURL},
                fields: [
                    {name: "Global Level", value: global?.level.toString(), inline: true},
                    {name: "Global Exp", value: global?.exp.toString(), inline: true},
                    {name: "\u200b", value: "\u200b", inline: true},
                    {name: "Server Level", value: server?.level.toString() ?? "error", inline: true},
                    {name: "Server Exp", value: server?.exp.toString() ?? "error", inline: true},
                    serverRankField
                ],
                timestamp: new Date
            }
        };
        return data;
    }
}
export default Level;