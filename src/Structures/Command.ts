import hyperion, {CommandContext, CommandResponse} from "../main";

export default abstract class Command {
    Hyperion: hyperion;
    name: string;
    path: string;
    help: {
        detail: string;
        usage: string;
        example?: string;
        subcommands?: string;
    };
    module: string;
    private: boolean;
    alwaysEnabled: boolean;
    aliases: Array<string>;
    subcommands?: Map<string, Command>;
    specialPerms?: "friend" | "contrib" | "support" | "staff" | "admin" | "dev";
    perms?: "mod" | "manager";
    cooldown: number;
    hasSub?: true;
    listUnder: string;
    pro: boolean;
    constructor(data: Partial<Command>, Hyperion: hyperion, path: string) {
        if(!data.name || !path || !data.module){throw new Error("name, module or path not found");}
        this.Hyperion = Hyperion;
        this.name = data.name;
        this.path = path;
        this.module = data.module;
        this.help = data.help ?? {detail: "dummy", usage: "dummy"};
        this.private = data.private ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;
        this.aliases = data.aliases ?? [];
        if(data.specialPerms){this.specialPerms = data.specialPerms;}
        if(data.perms){this.perms = data.perms;}
        this.cooldown = data.cooldown ?? 2;
        if(data.hasSub){this.hasSub = true;}
        this.listUnder = data.listUnder ?? this.module;
        this.pro = data.pro ?? false;
    }

    abstract execute(ctx: CommandContext): Promise<CommandResponse>;
    
}