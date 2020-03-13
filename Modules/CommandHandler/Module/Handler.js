



async function handler(msg){
    let ctx = {};

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
    ctx.dev = false;
    ctx.admin = false;
    ctx.msg = msg;
    ctx.user = msg.author;
    ctx.member = msg.member;
    ctx.channel = msg.channel;
    ctx.guild = msg.channel.guild;
    ctx.Hyperion = this;

    let isolated = isolate(ctx.guildconf, this, msg.content, false);

    if(!isolated){return;}

    if(isolated.type === "dev" || isolated.type === "admin"){
        
        const admin = await isAdmin(ctx, msg.author.id);
        if(!admin){
            isolated = isolate(ctx.guildconf, this, msg.content, true);
        }else{
            ctx.admin = true;
            ctx.dev = isDev(ctx, msg.author.id);
        }
    }

    if(!isolated){return;}

    let com = await findCommand(isolated.label, ctx);
    if(!com){return;}
    if(com.status.code === 6){return com}
    ctx.command = com.payload;

    const global = await globalChecks(ctx);
    if(!global){return;}
    if(global.status.code !== 0){return global;}

    ctx.permLevel = await memberGuildPerms(ctx);
    if(!(ctx.dev || ctx.admin)){
        const guildcheck = await guildChecks(ctx);
        if(!guildcheck){return;}
        if(guildcheck.status.code !== 0){return guildcheck;}
    }
    if(!ctx.dev){
        if(ctx.permLevel < 2){
            const ignored = await guildIgnored(ctx);
            if(!ignored){return;}
            if(ignored.status.code !== 0){return ignored;}

            const guildRole = await guildRoleChecks(ctx);
            if(!guildRole){return;}
            if(guildRole.status.code !== 0){return guildRole;}

            const guildChannel = await guildChannelChecks(ctx)
            if(!guildChannel){return;}
            if(guildChannel.status.code !== 0){return guildChannel;}
        }
    }

    if(!ctx.dev){
        const cooldown = await cooldownCheck(ctx);
        if(!cooldown){return;}
        if(cooldown.status.code !== 0){return cooldown;}
    }

    const result = await executeCommand(ctx);
    if(!result){return;}
    postExecute(ctx);
    return result;
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
    Hyperion.guilds.get(guild.id).guildconf = guildconf;
    return {status:{code: 0}, payload: guildconf};

}

async function isolate(guildconf, Hyperion, content, retry){
    content = content.replace("<@!", "<@");

    let args;
    let label = "";

    if(!retry){
        if(content.startsWith(Hyperion.config.devPrefix)){
            args = content.split(" ").slice(1);
            label = content.split(" ").slice(0, 1)[0].slice(Hyperion.config.devPrefix.length).trim().toLowerCase();
            return {type: "dev", label: label, args: args}
        }

        if(content.startsWith(Hyperion.config.adminPrefix)){
            label = content.split(" ").slice(0, 1)[0].slice(Hyperion.config.adminPrefix.length).trim().toLowerCase();
            return {type: "admin", label: label, args: args}
        }
    }

    if(content.startsWith(Hyperion.user.mention)){
        args = content.split(" ").slice(2);
        label = content.split(" ").slice(1, 2)[0].trim.toLowerCase();
        return {type: "mention", command: label, args: args};
    }
    
    if(content.startsWith(guildconf.prefix)){
        args = content.split(" ").slice(1);
        label = content.split(" ").slice(0, 1)[0].slice(guildconf.prefix.length).trim().toLowerCase();
        return {type: "normal", command: label, args: args}
    }
}

async function isAdmin(ctx, user){
    const data = await ctx.Hyperion.models.user.findOne({user: user.id}).exec();
    if(data.acks.admin || data.acks.developer || data.acks.owner){
        return true;
    }
    return false;
}

async function isDev(ctx, user){
    const data = await ctx.Hyperion.models.user.findOne({user: user.id}).exec();
    if(data.acks.developer || data.acks.owner){
        return true;
    }
    return false;
}

async function findCommand(label, ctx){
    let command = ctx.Hyperion.commands.find(c => (c.name === label) || (c.aliases.includes(label)));
    if(!command){
        return {status: {code: 6}};
    }
    return {status: {code: 0}, payload: command};
}

async function globalChecks(ctx){
    if(ctx.Hyperion.global.blacklist.includes(ctx.user.id)){
        return {status: {code: 5}, payload: "User blacklisted"};
    }

    if(ctx.Hyperion.global.gDisabledMods.includes(ctx.cmd.module.name)){
        return {status: {code: 5}, payload: "Module globally disabled"};
    }

    if(ctx.Hyperion.gDisabledCommands.includes(ctx.cmd.name)){
        return {status: {code: 5}, payload: "Command globally disabled"};
    }
    return {status: {code: 0}};
}

async function guildChecks(ctx){
    if(ctx.guildconf.modules[ctx.command.module] === undefined){
        ctx.guildconf.modules[ctx.command.module] = true;
        ctx.Hyperion.guilds.get(ctx.guild.id).guildconf.modules[ctx.command.module] = true;
        updateModConf(ctx, ctx.command.module, true);
    }

    if(ctx.guildconf.commands[ctx.command.name] === undefined){
        ctx.guildconf.commands[ctx.command.name] = true;
        ctx.Hyperion.guilds.get(ctx.guild.id).guildconf.commands[ctx.command.name] = true;
        updateCmdConf(ctx, ctx.command.name, true);
    }

    if(ctx.guildconf.modules[ctx.command.module] === false){
        return {status: {code: 5}, payload: "Module server disabled"};
    }

    if(ctx.guildconf.commands[ctx.command.name] === false){
        return {status: {code: 5}, payload: "Command Server Disabled"};
    }
    return {status: {code: 0}};
}

async function memberGuildPerms(ctx){
    if(ctx.member.has("administrator")){
        return 3;
    }
    if(ctx.member.has("manageGuild")){
        return 2;
    }
    ctx.member.roles.forEach(role => {
        if(ctx.guildconf.mod.modRoles.includes(role)){
            return 1;
        }
    });
    return 0;
}

async function guildIgnored(ctx){
    if(ctx.guildconf.ignoredChannels.includes(ctx.channel.id)){
        return {status: {code: 5}};
    }

    if(ctx.guildconf.ignoredUsers.includes(ctx.user.id)){
        return {status: {code: 5}};
    }
    return {status: {code: 0}};
}

async function guildRoleChecks(ctx){
    const cgconf = ctx.guildconf.commands[ctx.command.name];
    if(cgconf.disabledRoles.length !== 0){
        ctx.member.roles.forEach(role => {
            if(cgconf.disabledRoles.includes(role)){
                return {status: {code: 5}, payload: "disabled role"};
            }
        })
    }
    if(cgconf.allowedRoles.length !== 0){
        ctx.member.roles.forEach(role => {
            if(cgconf.allowedRoles.includes(role)){
                return {status: {code: 0}};
            }
        });
        return {status: {code: 5}, payload: "User did not have allowed role"};
    }
    return {status: {code: 0}};
}

async function guildChannelChecks(ctx){
    const cgconf = ctx.guildconf.commands[ctx.command.name];
    if(cgconf.disabledChannels.length !== 0){
        if(cgconf.disabledChannels.includes(ctx.channel)){
            return {status: {code: 5}, payload: "Disabled Channel"};
        }
    }
    if(cgconf.allowedChannels.length !== 0){
        if(!cgconf.allowedChannels.includes(ctx.channel)){
            return {status: {code: 5}, payload: "Not an allowed channel"};
        }
    }
    return {status: {code: 0}};
}

async function cooldownCheck(ctx){
    if(ctx.Hyperion.modules.get("commandhandler").cooldowns[ctx.user.id] !== undefined){
        let cooldown = ctx.Hyperion.modules.get("commandhandler").cooldowns[ctx.user.id];
        if((Date.now() - cooldown.ranAt) < ctx.Hyperion.global.globalCooldown){
            return {status: {code: 7}, payload: "Global Cooldown"};
        }
        if((Date.now() - cooldown.ranAt) < cooldown.cooldownTime){
            return {status: {code: 7}, payload: "Command Cooldown"};
        }
        delete ctx.Hyperion.modules.get("commandHandler").cooldowns[ctx.user.id]
    }
    return {status: {code: 0}};
}

async function executeCommand(ctx){
    const result = await ctx.command.execute(ctx).catch(err =>{
        ctx.Hyperion.logger.error("Hyperion", "Command Error", `Error executing ${ctx.command.name}, Command Call: ${ctx.msg.content}\nerror: ${err}`);
        ctx.Hyperion.sentry.configureScope(function(scope){
            scope.setExtra("Command String", ctx.msg.content);
            scope.setExtra("Guild", ctx.guild.id)
        })
        ctx.Hyperion.sentry.captureException(err);
    });
    return result;
}

async function postExecute(ctx){
    const cooldown = {
        command: ctx.command.name,
        ranAt: Date.now(),
        cooldownTime: ctx.command.cooldownTime
    }
    ctx.Hyperion.modules.get("commandhandler").cooldowns[ctx.user.id] = cooldown;
}

async function updateModConf(ctx, mod, status){
    
    let conf = ctx.Hyperion.models.findOne({guild: ctx.guild.id}).exec();
    conf.modules[mod] = status;
    conf.save().catch(err => {
        if(err !== null){
            ctx.Hyperion.logger.error("Hyperion", "Update Guild Conf", `Failed to add new module status to guild conf on guild: ${ctx.guild.id}, err: ${err}`);
        }
    });
}

async function updateCmdConf(ctx, cmd, status){
    let template = {
        status: status,
        allowedChannels: [],
        disabledChannels: [],
        allowedRoles: [],
        disabledRoles: []
    }
    let conf = await ctx.Hyperion.models.findOne({guild: ctx.guild.id}).exec();
    conf.commands[cmd] = template;
    conf.save().catch(err => {
        if(err !== null){
            ctx.Hyperion.logger.error("Hyperion", "Update Guild Conf", `Failed to add new command status to guild conf on guild: ${ctx.guild.id}, err: ${err}`);
        }
    });
}
exports.modfile = handler;