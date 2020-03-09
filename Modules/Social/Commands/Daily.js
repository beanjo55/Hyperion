const command = require('../../../Core/Structures/Command.js').struct;
const msc = require("pretty-ms");
const {randomInt} = require('mathjs')
const day = 86400000;

class Daily extends command{
    constructor(){
        super();
        this.name = "daily";
        this.id = this.name;
        this.module = "Social";

        this.helpDetail = "Collects your daily money, or give your daily money to someone else";
        this.helpUsage = "{prefix}daily\n{prefix}daily user";
        this.helpUsageExample = "{prefix}daily\n{prefix}daily @bean";
    }
    //returns the cooldown time
    getTime(userdata){
        return Date.now() - userdata.lastDailyTime;
    }

    async execute(ctx){

        const payout = randomInt(range[0], range[1]);
        const range = ctx.Hyperion.globals.dailyRange;
        const user = ctx.user;

        if(ctx.args.length > 0){

            const target = ctx.Hyperion.resolvers.hoistUser(ctx.msg, ctx.args[0], ctx.msg.channel.guild.members);
            if(!target){
                return {status: {code: 4, message: "I don't know who that is, try again"}};
            }

            let targetdata;
            if(ctx.Hyperion.models.social.exists({user: target.id})){
                targetdata = await ctx.Hyperion.models.social.findOne({user: target.id});
            }else{
                targetdata = new ctx.Hyperion.models.social({user: target.id});
            }

            let giverdata;
            if(ctx.Hyperion.models.social.exists({user: ctx.msg.author.id})){
                giverdata = await ctx.Hyperion.models.social.findOne({user: ctx.msg.author.id});
            }else{
                giverdata = new ctx.Hyperion.models.social({user: ctx.msg.author.id});
            }

            if((!this.getTime(giverdata) >= day)){
                if(!ctx.dev){
                    return {status: {code: 0, msg: `You can give your daily money in ${msc(day - this.getTime(giverdata))}`}}
                }
            }

            if(target.id === ctx.msg.author.id){
                giverdata.money += payout;
                giverdata.lastDailyTime = Date.now();

                giverdata.save().catch(err => {
                    ctx.Hyperion.logger("Hyperion", "Daily", `Error saving daily for ${ctx.user.id}, err: ${err}`)
                    return {status: {code: 2, message: "an error occured", error: err}};
                });

                return {status: {code: 0, message: `You gave your daily money of ${payout}$ to yourself, but y tho?`}};
            }

            giverdata.lastDailyTime = Date.now();
            targetdata.money += payout;

            targetdata.save().catch(err => {
                ctx.Hyperion.logger("Hyperion", "Daily", `Error saving daily for ${ctx.user.id}, err: ${err}`)
                return {status: {code: 2, message: "an error occured", error: err}};
            });

            giverdata.save().catch(err => {
                ctx.Hyperion.logger("Hyperion", "Daily", `Error saving daily for ${ctx.user.id}, err: ${err}`)
                return {status: {code: 2, message: "an error occured", error: err}};
            });

            const message = `${ctx.msg.author.mention} gave their daily money of ${payout} to ${target.mention}!`;
            return {status: {code: 0, message: message}};


        }else{

            let userdata = await ctx.Hyperion.models.social.findOne({user: user.id}).exec();

            if(!(this.getTime(userdata) >= day)){
                if(!ctx.dev){
                    return {status: {code: 0, msg: `you can collect your daily money in ${msc(day - this.getTime(userdata))}`}}
                }
            }
            userdata.lastDailyTime = Date.now();
            userdata.money += payout;
            userdata.save().catch(err => {
                ctx.Hyperion.logger("Hyperion", "Daily", `Error saving daily for ${ctx.user.id}, err: ${err}`)
                return {status: {code: 2, message: "an error occured", error: err}};
            });

            return {status:{code: 0, message: `You collected your daily of ${payout}$!`}};
        }
    }
}
exports.command = Daily;