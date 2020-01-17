
const { command } = require('../command.js');
const config = require("../config.json");
const { Hyperion } = require("../main.js");



class Whois extends command{
    constructor(){
        super();
        this.name = "whois";
        this.aliases = ["w", "userinfo"];
    }






}
exports.cmd = Whois;