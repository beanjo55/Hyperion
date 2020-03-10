const {command} = require("../command.js");
const { resolveUser } = require("../util.js");
const Embed = require("embedcord");
const msc = require("pretty-ms");
const day = 86400000;
const {randomInt} = require('mathjs');
const upper = 350;
const lower = 150;

class Rep extends command{
    constructor(){
        super();
        this.name = "daily";
        this.id = this.name;
        this.aliases = ["dailies"];
        this.commandType = "fun";
        this.helpInfo = "colelct your daily money, or give someone yours, or checks how much you have \n`daily check` to check your balance";
    }
    async execute(msg, args, Hyperion, dev){
        let message = "An unexpected error occured"
        if(args[0] === "check"){
            message = await this.check(msg, args, Hyperion);
        }else{
            if(args.length === 0){
                message = await this.self(msg, Hyperion, dev);
            }else{
                message = await this.give(msg, args, Hyperion, dev);
            }
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
                lastRepTime: 0,
                lastDailyTime: 0,
                money: 0
            });
            
        }else{
            Hyperion.models.rep.updateOne({userID: user.id});
            repdata = await Hyperion.models.rep.findOne({'userID': user.id}).exec();
        }

        if(!repdata.lastDailyTime){
            repdata.lastDailyTime = 0;
            repdata.money = 0;
        }

        const embed = new Embed.DiscordEmbed()
        .setColor(Hyperion.constants.defaultColorHex)
        .setTitle(`${user.username}'s money stats`)
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField("Money", `${repdata.money}$`, true)
        

        await repdata.save(function (err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create money entry for checked user ${user.id}, error: ${err}`);
                return;
            }
        });
        return embed;

    }

    async self(msg, Hyperion, dev){
        let userdata;
        if(await Hyperion.models.rep.exists({userID: msg.member.id})){
            Hyperion.models.rep.updateOne({userID: msg.member.id})
            userdata = await Hyperion.models.rep.findOne({userID: msg.member.id});
        }else{
            userdata = new Hyperion.models.rep({
                userID: msg.member.id,
                given: 0,
                recieved: 0,
                money: 0,
                lastRepTime: 0,
                lastDailyTime: 0
            });
        }
        
        if(!userdata.lastDailyTime){
            userdata.lastDailyTime = 0;
            userdata.money = 0;
        }

        const payout = randomInt(lower, upper);

        if(!dev){
            if(userdata.lastDailyTime !== 0){
                const timesince = Date.now() - userdata.lastDailyTime;
                if(!(timesince >= day)){
                    return `you can give more money in ${msc(day-timesince)}`;
                }
            }
        }

        userdata.money += payout;
        userdata.lastDailyTime = Date.now();

        await userdata.save(function(err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create money entry for user ${msg.member.id}, error: ${err}`);
            }
            return;
        });

        return  `You collected your daily money of ${payout}$`
    }

    async give(msg, args, Hyperion, dev){
        const payout = randomInt(lower, upper);
        const user = resolveUser(msg, args[0]);
        if(msg.member.id === user.id){
            return "You cant give your daily to yourself, do it the normal way!"
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
                lastRepTime: 0,
                lastDailyTime: 0,
                money: 0
            });
        }else{
            Hyperion.models.rep.updateOne({userID: user.id});
            targetdata = await Hyperion.models.rep.findOne({'userID': user.id}).exec();
        }
        if(!giverexists){
            giverdata = new Hyperion.models.rep({
                userID: msg.member.id,
                given: 0,
                recieved: 0,
                lastRepTime: 0,
                lastDailyTime: 0,
                money: 0
            });
        }else{
            Hyperion.models.rep.updateOne({userID: msg.member.id});
            giverdata = await Hyperion.models.rep.findOne({'userID': msg.member.id}).exec();
        }


        if(!giverdata.lastDailyTime){
            giverdata.lastDailyTime = 0;
            giverdata.money = 0;
        }
        if(!targetdata.lastDailyTime){
            targetdata.lastDailyTime = 0;
            targetdata.money = 0;
        }

        if(!dev){
            if(giverdata.lastDailyTime !== 0){
                const timesince = Date.now() - giverdata.lastDailyTime;
                if(!(timesince >= day)){
                    return `you can give more money in ${msc(day-timesince)}`;
                }
            }
        }
        
        targetdata.money = targetdata.recieved+payout;
        giverdata.lastDailyTime = Date.now();
        await targetdata.save(function(err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create money entry for user ${user.id}, error: ${err}`);
                return;
            }
        })
        await giverdata.save(function(err){
            if(err !== null){
                Hyperion.logger.error(`Failed to create money entry for user ${msg.member.id}, error: ${err}`);
                return;
            }
        })
        return `${msg.member.mention} has given ${user.mention} their daily money of ${payout}!`;
    }
}

exports.cmd = Rep;