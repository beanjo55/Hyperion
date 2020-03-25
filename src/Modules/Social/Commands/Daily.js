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

    async save(doc, ctx){
        doc.save().catch(err => {
            ctx.Hyperion.logger("Hyperion", "Daily", `Error saving daily for ${doc.user}, err: ${err}`)
            return {status: {code: 2, error: err}, payload: "an error occured"};
        });
    }

    async getDoc(id, ctx){
        if(await ctx.Hyperion.models.social.exists({user: id})){
            return await ctx.Hyperion.models.social.findOne({user: id});
        }else{
            return new ctx.Hyperion.models.social({user: id});
        }
    }

    async execute(ctx){

        const payout = randomInt(range[0], range[1]);
        const range = ctx.Hyperion.globals.dailyRange;
        const user = ctx.user;

        if(ctx.args.length > 0){

            const target = ctx.Hyperion.resolvers.hoistUser(ctx.msg, ctx.args[0], ctx.guild.members);
            if(!target){
                return {status: {code: 4}, payload: "I don't know who that is, try again"};
            }

            let targetdata = await this.getDoc(target.id, ctx);

            let giverdata = await this.getDoc(ctx.user.id, ctx);

            if((!this.getTime(giverdata) >= day)){
                if(!ctx.dev){
                    return {status: {code: 0}, payload: `You can give your daily money in ${msc(day - this.getTime(giverdata))}`}
                }
            }

            if(target.id === user.id){
                giverdata.money += payout;
                giverdata.lastDailyTime = Date.now();

                this.save(giverdata, ctx);

                return {status: {code: 0, message: `You gave your daily money of ${payout}$ to yourself, but y tho?`}};
            }

            giverdata.lastDailyTime = Date.now();
            targetdata.money += payout;

            this.save(targetdata, ctx);
            this.save(giverdata, ctx);

            let message;
            if(targetdata.socialPings){
                message = `${user.mention} gave their daily money of ${payout} to ${target.mention}!`;
            }else{
                message = `${user.mention} gave their daily money of ${payout} to ${target.username}!`;
            }
            return {status: {code: 0}, payload: message};


        }else{

            let userdata = await this.getDoc(ctx.user.id, ctx);

            if(!(this.getTime(userdata) >= day)){
                if(!ctx.dev){
                    return {status: {code: 0}, payload: `You can collect your daily money in ${msc(day - this.getTime(userdata))}`}
                }
            }
            userdata.lastDailyTime = Date.now();
            userdata.money += payout;
            this.save(userdata, ctx);

            return {status:{code: 0}, payload: `You collected your daily of ${payout}$!`};
        }
    }
}
exports.command = Daily;