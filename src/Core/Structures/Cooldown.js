class Cooldown{
    constructor(data){
        this.id = data.id;
        this.time = Date.now
    }
}
exports.struct = Cooldown;