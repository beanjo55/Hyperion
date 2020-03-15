class ReadyHandler{
    constructor(){
        this.name = "ready";
    }
    async handle(){
        this.logger.success("Hyperion", "Ready Event", "Hyperion Ready");
        this.editStatus({name: "v2", type: 0});
    }
}
exports.event = new ReadyHandler;