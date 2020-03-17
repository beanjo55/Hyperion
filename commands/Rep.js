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
        let repdata = null;
        if(!exists){
            repdata = new Hyperion.models.rep({
                userID: user.id,
                recieved: 0,
                given: 0,
                lastRepTime: 0
            });
            
        }else{
            repdata = await Hyperion.models.rep.findOne({'userID': user.id}).exec();
        }

        const embed = new Embed.DiscordEmbed()
        .setColor(Hyperion.constants.defaultColorHex)
        .setTitle(`${user.username}'s rep stats`)
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField("Rep Recieved", `${repdata.recieved}`, true)
        .addField("Rep Given", `${repdata.given}`, true);

        await repdata.save(function (err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create rep entry for checked user ${user.id}, error: ${err}`);
            }
        });
        return embed;

    }

    async give(msg, args, Hyperion, dev){
        const user = resolveUser(msg, args[0]);

        if(!user){
            return "Who?";
        }
        if(msg.member.id === user.id){
            return "You cant rep yourself!"
        }
        const targetexists = await Hyperion.models.rep.exists({userID: user.id});
        const giverexists = await Hyperion.models.rep.exists({userID: msg.member.id});
        let giverdata = null;
        let targetdata = null;
        if(!targetexists){
            targetdata = new Hyperion.models.rep({
                userID: user.id,
                given: 0,
                recieved: 0,
                lastRepTime: 0
            });
        }else{
            targetdata = await Hyperion.models.rep.findOne({'userID': user.id}).exec();
        }
        if(!giverexists){
            giverdata = new Hyperion.models.rep({
                userID: msg.member.id,
                given: 0,
                recieved: 0,
                lastRepTime: 0
            });
        }else{
            giverdata = await Hyperion.models.rep.findOne({'userID': msg.member.id}).exec();
        }
        if(!dev){
            if(giverdata.lastRepTime !== 0){
                const timesince = Date.now() - giverdata.lastRepTime;
                if(!(timesince >= day)){
                    return `you can give more rep in ${msc(day-timesince)}`;
                }
            }
        }
        giverdata.given = giverdata.given+1;
        targetdata.recieved = targetdata.recieved+1;
        giverdata.lastRepTime = Date.now();
        await targetdata.save(function(err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create rep entry for user ${user.id}, error: ${err}`);
            }
        })
        await giverdata.save(function(err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create rep entry for user ${msg.member.id}, error: ${err}`);
            }
        })
        return `${msg.member.mention} has given ${user.mention} 1 rep point!`;
    }
}

exports.cmd = Rep;