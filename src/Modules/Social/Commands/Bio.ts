import {Command} from "../../../Core/Structures/Command";
// eslint-disable-next-line no-unused-vars
import {CommandContext, HyperionInterface} from "../../../types";

class Bio extends Command{
    constructor(){
        super({
            name: "bio",
            module: "social",

            helpDetail: "Sets your bio that is displayed in whois",
            helpUsage: "{prefix}bio [text]",
            helpUsageExample: "{prefix}bio Hi I'm bean"
        });
    }

    async execute(ctx: CommandContext, Hyperion: HyperionInterface){
        if(ctx.args.length === 0){
            let current = await Hyperion.managers.user.getBio(ctx.user.id);
            if(!current || current === ""){return "You dont have a bio set";}
            return `Your current bio is: ${current}`;
        }
        let bio = ctx.args.join(" ");
        if(bio.length > 1020){
            return "That bio is too long, try a shorter one";
        }
        Hyperion.managers.user.setBio(ctx.user.id, bio);
        return "Your bio has been set!";
    }
}
export default Bio;