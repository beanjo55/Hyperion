import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";
// eslint-disable-next-line no-unused-vars
import {Member} from "eris";

class Avatar extends Command{
    constructor(){
        super({
            name: "avatar",
            module: "info",
            aliases: ["av"],

            helpDetail: "Shows a user's avatar",
            helpUsage: "{prefix}avatar\n{prefix}avatar @user",
            helpUsageExample: "{prefix}avatar @bean"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        let target: Member | undefined;
        if(ctx.args[0]){
            target = Hyperion.utils.hoistResolver(ctx.msg, ctx.args[0], ctx.guild.members);
        }else{
            target = ctx.member;
        }

        if(!target){return "Who?";}

        const data = {
            embed: {
                timestamp: new Date(),
                color: Hyperion.defaultColor,
                author: {
                    name: `Avatar for ${target.username}#${target.discriminator}`,
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