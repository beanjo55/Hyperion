




//finds the command object specified by the search
function findCommand(search, Hyperion){
    return Hyperion.commands.find(com => (com.name === search) || (com.aliases.includes(search)));
}


//checks if command is dev or internal, and if it should be shown/executed
function checkInternal(member, Hyperion){
    return Hyperion.constants.config.staff.includes(member.id);
}

function checkDev(member, Hyperion){
    return Hyperion.constants.config.owner === member.id;
}


//check if the executing user is on the required user list
function checkRequiredUsers(member, command){
    return command.requiredUsers.includes(member.id);
}

async function checkPerms(msg, member, command, Hyperion){
    if(command.requiredPerms.includes("mod")){
        const modRoles = await Hyperion.models.guild.findOne({'guildID': msg.channel.guild.id}, 'modRoles').exec();
        if(modRoles.length > 0){
            modRoles.forEach(mrole =>{
                if(member.roles.includes(mrole)){
                    return true;
                }
            });
        }
    }

    command.requiredPerms.forEach((perm) => {
        if(perm !== "mod"){
            if(member.permission.has(perm)){
                return true;
            }
        }
    });

    return false;
}

async function generalHelp(msg, Hyperion){
    const out = await commandList(Hyperion)
    let list = [];
    out.forEach(com =>{
        list.push(com.name)
    })
    const data = {
        embed: {
            color: 0xe87722,
            timestamp: new Date(),
            title: "Commands",
            description: list.join("\n")
        }
    }
    return await msg.channel.createMessage(data);
}

async function commandHelp(msg, command){
    const data = {
        embed: {
            description: command.helpInfo,
            color: 0xe87722,
            timestamp: new Date(),
            title: `Help for ${command.name}`
        }
    }
    return await msg.channel.createMessage(data);
}


//handles normal command execution
async function _commandHandler(msg, label, args, Hyperion){
    if(label === "help" && args.length === 0){
        return await generalHelp(msg, Hyperion);
    }
    if(label === "help" && args.length !== 0){
        const command = findCommand(args[0], Hyperion);
        if(!command){
            return;
        }
        return await commandHelp(msg, command);

    }
    if(label === "prefix" && args.length === 0){
        const aprefix = await Hyperion.models.guild.findOne({'guildID': msg.channel.guild.id}, 'prefix').exec();
        let prefix = aprefix.prefix[0];
        msg.channel.createMessage(`the prefix is \`${prefix}\``);
        return;
    }
    const command = findCommand(label, Hyperion);
    if(!command){
        return "no command"
    }
    if(command.commandType === "internal"){
        if(!checkInternal(msg.member, Hyperion)){
            return "unauthorized: internal";
        }
    }
    if(command.commandType === "dev"){
        if(!checkDev(msg.member, Hyperion)){
            return "unauthorized: dev";
        }
    }

    if(command.requiredUsers.length !== 0){
        if(!checkRequiredUsers(msg.member, command)){
            return "unauthorized: not a required user";
        }
    }

    if(command.requiredPerms.length !== 0){
        if(!checkPerms(msg, msg.member, command, Hyperion)){
            return "unathorized: missing permissions";
        }
    }


    await command.execute(msg, args, Hyperion, false).catch(err => {
        Hyperion.logger.error(`[Hyperion] command error on guild ${msg.channel.guild.id} from message ${msg.content}`);
        Hyperion.logger.error(err);
    });






    //signale.error(`[Hyperion] command error on guild ${msg.channel.guild.id} from message ${msg.content}`);
    //signale.error(err);
    

}


//handles dev command execution
async function _devCommandHandler(msg, label, args, Hyperion){
    const command = findCommand(label, Hyperion);
    if(!command){
        return;
    }
    await command.execute(msg, args, Hyperion, true).catch(err => {
        Hyperion.logger.error(`[Hyperion] command error on guild ${msg.channel.guild.id} from message ${msg.content}`);
        Hyperion.logger.error(err);
    });
}

//main handler function
async function handleCommand(msg, Hyperion){
    if(msg.author.bot){
        return;
    }
    if(!_preHandle(msg, Hyperion)){
        return "invalid";
    }

    const result = await _prefixHandle(msg, Hyperion);
    if(result[0] === "none"){
        return;
    }

    if(result[0] === "dev"){
        return await _devCommandHandler(msg, result[1], result[2], Hyperion);
    }

    if(result[0] === "normal"){
        return await _commandHandler(msg, result[1], result[2], Hyperion);
    }

    return "no command";

}


//detect and isolate normal prefix and args
async function _prefixHandle(msg, Hyperion){

    //test for dev prefix and authorized user
    if((msg.author.id === Hyperion.constants.config.owner) && (msg.content.startsWith(Hyperion.constants.config.devPrefix))){
        const args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        const label = cmdLabelar[0].slice(Hyperion.constants.config.devPrefix.length).toLowerCase();
        return ["dev", label, args];
    }

    //test for a guild's normal prefix
    const aprefix = await Hyperion.models.guild.findOne({'guildID': msg.channel.guild.id}, 'prefix').exec();
    let prefix = aprefix.prefix[0];
    if(msg.content.startsWith(prefix)){
        const args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        const label = cmdLabelar[0].slice(prefix.length).toLowerCase();
        return ["normal", label, args];
    }

    //test for mention prefix
    let contentClean = msg.content.replace(/<@!/g, "<@");
    if(contentClean.startsWith(Hyperion.user.mention)){
        const args = msg.content.split(" ").slice(2);
        const cmdLabelar = contentClean.split(" ").slice(1, 2);
        const label = cmdLabelar[0].trim().toLowerCase();
        return ["normal", label, args];
    }

    //no command prefix found, so no command will be checked for
    return ["none", null, null];
}





//checks that would stop immediately 
async function _preHandle(msg, Hyperion){
    if(msg.author.id === Hyperion.user.id){
        return false;
    }
    if(msg.member == null){
        return false;
    }
    if(msg.member.bot){
        return false;
    }
    if(Hyperion.blacklist.includes(msg.member.id)){
        return false;
    }

    //ensures the guild has an entry in the db, and creates one otherwise
    const registered = await Hyperion.models.guild.exists({ guildID: msg.channel.guild.id});
    if(!registered){
        await Hyperion.registerGuild(msg.channel.guild);
    }
    return true;
}

async function commandList(Hyperion){
    let out = Hyperion.commands.filter(com => ((com.commandType !== "dev") && (com.commandType !== "internal") && (com.commandType !== "developer")));
    return out
}

const handler = {
    find: findCommand,
    list: commandList,
    handle: handleCommand
};
exports.handler = handler;