





class command {
    constructor(){
        
        this.name = "unnamed"
        this.aliases = [];


        this.requiredGuilds = [];
        this.requiredRoles = [];
        this.requiredUsers = [];

        this.requiredPerms = [];

        this.alwaysEnabled = false;

        this.helpInfo = "someone waz lazy";

        this.commandType = "default";
    }
    async execute (){

    }

}
exports.command = command;