import { Message } from "eris";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import Command from "../../../Structures/Command";

export default class Test extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "test",
            help: {detail: "test", usage: "test"},
            module: "dev",
            aliases: ["wuper"]
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext): Promise<CommandResponse> {
        ctx.channel.createMessage("test");
        return {success: true, content: null, self: true};
    }
}