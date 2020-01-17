async function cmdBan(msg, args, context) {
    console.log("started ban");
    let botPerm = await msg.channel.guild.getRESTMember(context.user.id);
    if (!(botPerm.permission.has("administrator") || botPerm.permission.has("banMember"))) {
        context.createMessage(msg.channel.id, "I don't have permission to ban, please check my permissions then try again");
        return;
    }
    mention = null;
    if (msg.mentions.length != 0) {
        mention = msg.mentions[0];
    }
    if (mention != null) {
        if (mention.id === msg.author.id) {
            context.createMessage(msg.channel.id, "You can't ban yourself!");
            return;
        }
        mentionPerm = await msg.channel.guild.getRESTMember(mention.id);
        if (mentionPerm.permission.has("administrator") || mentionPerm.permission.has("manageGuild")) {
            context.createMessage(msg.channel.id, "That user is an Admin, I can't ban them");
            return;
        }
        if (mention.id === context.user.id) {
            context.createMessage(msg.channel.id, "I can't ban myself");
            return;
        }
        if (args.length > 1) {
            reason = args.slice(1, args.length).join(" ");
            //msg.channel.guild.banMember(mention.id, 7, reason);
            //context.createMessage(msg.channel.id, mention.mention + " was banned for " + reason);
            context.createMessage(msg.channel.id, mention + " was about to be banned by mention");
            context.createMessage(msg.channel.id, "For reason " + reason);
            return;
        }
        msg.channel.guild.banMember(mention.id, 7);
        return;
    }
    aID = args[0].match(/^\d+$/);
    if (aID !== null) {
    }
}
exports.cmdBan = cmdBan;
