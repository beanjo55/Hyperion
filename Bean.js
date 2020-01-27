const {command} = require("../command.js");


class Bean extends command{
    constructor(){
        super();
        this.name = "bean";
        this.id = this.name;
        this.commandType = "fun";
        this.helpInfo = "Bean your friends!"
    }
}
exports.cmd = Bean;