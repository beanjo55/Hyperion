class Cooldown{
    constructor(data){
        this.id = data.id;
        this.command = data.command;
        this.time = Date.now
    }
}
exports.struct = Cooldown;