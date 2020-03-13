class ReadyHandler{
    constructor(){
        this.name = "ready";
        this.handler = this.handle;
    }
    async handle(){

    }
}
exports.event = new ReadyHandler;