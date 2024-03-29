import {Command} from "../../../Structures/Command";
import {ICommandContext, IHyperion} from "../../../types";
import {AdvancedMessageContent} from "eris";

class Bio extends Command{
    constructor(){
        super({
            name: "bio",
            module: "social",

            helpDetail: "Sets your bio that is displayed in whois.",
            helpUsage: "{prefix}bio [text]",
            helpUsageExample: "{prefix}bio Hi I'm bean"
        });
    }

    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<string | AdvancedMessageContent>{
        if(ctx.args.length === 0){
            const current = await Hyperion.managers.user.getBio(ctx.user.id);
            if(!current || current === ""){return "You dont have a bio set!";}
            return {content: `Your current bio is: ${current}`, allowedMentions: {everyone: false, roles: false, users: false}};
        }
        const bio = ctx.args.join(" ");
        if(bio.length > 500){
            return "That bio is too long, be sure it's under 500 characters!";
        }
        Hyperion.managers.user.setBio(ctx.user.id, bio);
        return "Your bio has been set!";
    }
}
export default Bio;
