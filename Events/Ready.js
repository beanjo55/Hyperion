class ReadyHandler{
    constructor(){
        this.name = "ready";
    }
    async handle(){
        this.logger.success("Hyperion", "Ready Event", "Hyperion Ready");
    }
}
exports.event = new ReadyHandler;