



async function handler(msg){
    let ctx = {};
    ctx.msg = msg;
    ctx.user = msg.author;
    ctx.member = msg.member;
    ctx.channel = msg.channel;
    ctx.guild = msg.channel.guild;

    let config = await conf(msg.channel.guild, this);
    if(!config.status){
        return {status:{code: 1, error: new Error("Bad conf return")}};
    }
    if(!config.status.error){
        return config;
    }
    if(!config.payload){
        return {status:{code: 1, error: new Error("Bad conf return")}};
    }
    ctx.guildconf = config.payload;


}

async function conf(guild, Hyperion){
    let guildconf;
    if(!Hyperion.models.guildconf.exists({guild: guild.id})){
        guildconf = new Hyperion.models.guildconf({
            guild: guild.id
        });
        await guildconf.save().catch(err => {
            Hyperion.logger.error("Hyperion", "New Guild Config", `Failed to make new config in handler for ${guild.id}, err: ${err}`);
            return {status: {code: 1, error: err}};
        })
    }else{
        guildconf = await Hyperion.models.guildconf.findOne({guild: guild.id});
    }
    return {status:{code: 0}, payload: guildconf};

}