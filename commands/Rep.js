const {command} = require("../command.js");
const { resolveUser } = require("../util.js");
const Embed = require("embedcord");
const msc = require("pretty-ms");
const day = 86400000;

class Rep extends command{
    constructor(){
        super();
        this.name = "rep";
        this.id = this.name;
        this.aliases = ["reputation"];
        this.commandType = "fun";
        this.helpInfo = "gives someone a rep point, or checks how many you have";
    }
    async execute(msg, args, Hyperion, dev){
        let message = "An unexpected error occured"
        if(args.length === 0 || args[0] === "check"){
            message = await this.check(msg, args, Hyperion);
        }else{
            message = await this.give(msg, args, Hyperion, dev);
        }
        try{
            await msg.channel.createMessage(message)
        }catch(err){
            return Promise.reject(err);
        }
        return Promise.resolve("success")
    }

    async check(msg, args, Hyperion){
        let user = undefined;
        if(args[0] === "check"){
            user = resolveUser(msg, args[1]);
        }else{
            user = resolveUser(msg, args[0]);
        }
        const exists = await Hyperion.models.rep.exists({userID: user.id});
        let first = false;
        if(!exists){
            first = true;
            let repdata = new Hyperion.models.rep({
                userID: user.id,

            });
            await repdata.save(function (err){
                Hyperion.logger.error(`Failed to create rep entry for checked user ${user.id}, error: ${err}`);
            });
        }
        const data = await Hyperion.models.rep.findOne({'userID': user.id}).exec();
        const embed = new Embed.DiscordEmbed()
        .setColor(Hyperion.constants.defaultColorHex)
        .setTitle(`${user.username}'s rep stats`)
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        if(!first){
            embed.addField("Rep Recieved", `${data.recieved}`, true)
            .addField("Rep Given", `${data.given}`, true);
        }else{
            embed.addField("Rep Recieved", `0`, true)
            .addField("Rep Given", `0`, true);
        }
        return embed;

    }

    async give(msg, args, Hyperion, dev){
        const user = resolveUser(msg, args[0]);
        const targetexists = await Hyperion.models.rep.exists({userID: user.id});
        const giverexists = await Hyperion.models.rep.exists({userID: msg.member.id});
        let firstuser = false;
        let firstgiver = false;
        if(!targetexists){
            firstuser = true;
            await this.newEntry(user.id, Hyperion)
        }
        if(!giverexists){
            firstgiver = true;
            await this.newEntry(msg.member.id, Hyperion)
        }
        const giverdata = await Hyperion.models.rep.findOne({'userID': msg.member.id}).exec();
        const targetdata = await Hyperion.models.rep.findOne({'userID': msg.member.id}).exec();
        
        if(firstgiver){
            await Hyperion.models.rep.updateOne({ 'userID': msg.member.id}, { 'given': 1, 'lastRepTime': Date.now()});
        }else{
            if(!dev){
                if(typeof giverdata.lastRepTime === Number){
                    const timesince = Date.now() - giverdata.lastRepTime;
    
                    if(!(timesince >= day)){
                        return `you can give more rep in ${msc(day-timesince)}`;
                    }
                }
            }
            await Hyperion.models.rep.updateOne({ 'userID': msg.member.id}, { 'given': giverdata.given+1, 'lastRepTime': Date.now()});
        }
        if(firstuser){
            await Hyperion.models.rep.updateOne({ 'userID': user.id}, { 'recieved': targetdata.recieved+1});
        }else{
            await Hyperion.models.rep.updateOne({ 'userID': user.id}, { 'recieved': 1});
        }
        return `${msg.member.mention} has given ${user.mention} 1 rep point!`;
    }
    async newEntry(id, Hyperion){
        let repdata = new Hyperion.models.rep({
            userID: id,
            given: 0,
            recieved: 0,
            lastRepTime: 0,
        });
        await repdata.save(function (err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create rep entry for user ${id}, error: ${err}`);
            }
        });
    }
}

exports.cmd = Rep;