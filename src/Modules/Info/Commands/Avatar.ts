import {Command} from "../../../Core/Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import {Member, Embed} from "eris";

class Avatar extends Command{
    constructor(){
        super({
            name: "avatar",
            module: "info",
            aliases: ["av"],

            helpDetail: "Shows a user's avatar.",
            helpUsage: "{prefix}avatar\n{prefix}avatar @user",
            helpUsageExample: "{prefix}avatar @bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<{embed: Partial<Embed>} | string>{
        let target: Member | undefined;
        if(ctx.args[0]){
            target = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        }else{
            target = ctx.member;
        }

        if(!target){return "That user was not found!";}

        const data = {
            embed: {
                timestamp: new Date(),
                color: Hyperion.defaultColor,
                author: {
                    name: `Avatar for ${target.username}#${target.discriminator}`,
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    icon_url: target.avatarURL
                },
                image: {
                    url: target.avatarURL
                }
            }
        };
        return data;
    }
}
export default Avatar;