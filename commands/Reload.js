/* eslint-disable no-unused-vars */
const { command } = require('../command.js');
const config = require("../config.json");
const { Hyperion } = require("../main.js");





class Reload extends command {
    constructor(){
        super();

        this.name = "reload";
        this.aliases = ["rl"];
        this.id = this.name;
        this.requiredUsers = ["253233185800847361"];
    }

    async execute (msg, args, Hyperion) {
        let toFind = args[0];
        const found = Hyperion.commands.find(com => (com.name === toFind));
        const index = Hyperion.commands.indexOf(found);
        const correctToFind = toFind.replace(/^\w/, c => c.toUpperCase());
        
        const fpath = `./${correctToFind}.js`
        delete require.cache[require.resolve(fpath)];
        const newc = require(fpath);
        const loaded = new newc.cmd();
        Hyperion.commands.splice(index, 1, loaded);
    }
}
exports.cmd = Reload;