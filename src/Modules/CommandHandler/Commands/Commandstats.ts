import CommandHandler from "../CommandHandler";
import hyperion, {CommandContext, CommandResponse} from "../../../main";
import Command from "../../../Structures/Command";

export default class Test extends Command {
    constructor(Hyperion: hyperion, path: string){
        super({
            name: "commandstats",
            help: {detail: "test", usage: "test"},
            module: "commandHandler",
            aliases: ["cs"],
            specialPerms: "dev"
        }, Hyperion, path);
    }

    async execute(ctx: CommandContext<CommandHandler>): Promise<CommandResponse> {
        if(!ctx.args[0]){
            return {success: false, content: "error"};
        }
        const command = ctx.module.findCommand(ctx.args[0]);
        if(!command){return {success: false, content: "error"};}
        const uses = await this.Hyperion.redis.get(`CommandStats:${command.name}`) ?? "0";
        return {success: true, content: `${command.name} has been used ${uses} times!`, literal: true, status: "fancySuccess"};
    }
}