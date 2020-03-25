const CommandContext = require("../../../Core/Structures/CommandContext.js");

class Handler{
    constructor(conf){
        this.logLevel = conf.logLevel || 1;
        this.admin = conf.admin;
        this.dev = conf.admin;
    }

    async handle(msg){

    }

    async isolate(content, guildconf){

    }

    async findCommand(label)
}