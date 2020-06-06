import {Collection} from "eris";
import {IHyperion, ICommandContext} from "../../types";

export class Command{
    name: string;
    id: string;
    module: string;
    aliases: Array<string>;
    internal: boolean;
    alwaysEnabled: boolean;
    userperms: Array<string>;
    botperms: Array<string>;
    needsRolepos: boolean;
    dev: boolean;
    admin: boolean;
    support: boolean;
    cooldownTime: number;
    helpDetail: string;
    helpAliases: string;
    helpSubcommands: string;
    helpUsage: string;
    helpUsageExample: string;
    noExample: boolean;
    hasSub: boolean;
    selfResponse: boolean;
    subcommands: Collection<Command>;


    constructor(data: Partial<Command>){
        this.name = data.name ?? "dummy";
        this.id = this.name;
        this.module = data.module ?? "default";
        this.aliases = data.aliases ?? [];

        this.internal = data.internal ?? false;
        this.alwaysEnabled = data.alwaysEnabled ?? false;

        this.userperms = data.userperms ?? [];
        this.botperms = data.botperms ?? [];
        this.needsRolepos = data.needsRolepos ?? false;

        this.dev = data.dev ?? false;
        this.admin = data.admin ?? false;
        this.support = data.support ?? false;

        this.cooldownTime = data.cooldownTime ?? 2000;

        this.helpDetail = data.helpDetail ?? "dummy";
        this.helpAliases = data.helpAliases ?? "dummy";
        this.helpSubcommands = data.helpSubcommands ?? "dummy";
        this.helpUsage = data.helpUsage ?? "dummy";
        this.helpUsageExample = data.helpUsageExample ?? "dummy";
        this.noExample = data.noExample ?? false;

        this.hasSub = data.hasSub ?? false;

        this.selfResponse = data.selfResponse ?? false;
        this.subcommands = new Collection(Command);
    }


    //dummy default command 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(ctx: ICommandContext, Hyperion: IHyperion): Promise<unknown>{
        throw new Error("Unimplemented command!");
    }

}
