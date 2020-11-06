import hyperion from "../main";

export default class Command {
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
    constructor(data: Partial<Command>, Hyperion: hyperion) {
        if(!data.name || !data.path || !data.module){throw new Error("name, module or path not found");}
        this.Hyperion = Hyperion;
        this.name = data.name;
        this.path = data.path;
        this.module = data.module;
        this.help = data.help ?? {detail: "dummy", usage: "dummy"};
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: unknown): Promise<unknown> {
        throw new Error("Unimplemented execute!");
    }
    
}