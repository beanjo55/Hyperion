import {Collection} from 'eris';


interface CommandConstructor extends Command{
    new (): Command;
}

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
    hasSub: boolean;
    selfResponse: boolean;
    subcommandslist: Array<CommandConstructor>;
    subcommands: Collection<Command>;


    constructor(){
        this.name = "dummy";
        this.id = this.name;
        this.module = "default";
        this.aliases = [];

        this.internal = false;
        this.alwaysEnabled = false;

        this.userperms = [];
        this.botperms = [];
        this.needsRolepos = false;

        this.dev = false;
        this.admin = false;
        this.support = false;

        this.cooldownTime = 2000;

        this.helpDetail = "dummy";
        this.helpAliases = "dummy";
        this.helpSubcommands = "dummy";
        this.helpUsage = "dummy";
        this.helpUsageExample = "dummy";

        this.hasSub = false;

        this.selfResponse = false;
        this.subcommandslist = [];
        this.subcommands = new Collection(Command)
    }

    async registerSubcommands(){
        this.subcommands = new Collection(Command);
        if(this.subcommandslist.length > 0){
            this.subcommandslist.forEach((cmd: CommandConstructor) =>{
                this.subcommands.add(new cmd);
            })
        }
    }

    //dummy default command 
    async execute(){
        throw new Error("Unimplemented command!");
    }

}
