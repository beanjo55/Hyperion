




//finds the command object specified by the search
function findCommand(search, Hyperion){
    return Hyperion.commands.find(com => (com.name === search) || (com.aliases.includes(search)));
}


//checks if command is dev or internal, and if it should be shown/executed
function checkInternal(member, command){

}


//check if the executing user is on the required user list
function checkRequiredUsers(member, command){
    return command.requiredUsers.includes(member.id);
}

async function generalHelp(msg, Hyperion){
    const list = commandList(Hyperion);
    const data = {
        embed: {
            color: 0xe87722,
            timestamp: new Date(),
            title: "Commands",
            description: list.join("\n")
        }
    }
    return msg.channel.createMessage(data);
}


//handles normal command execution
async function _commandHandler(msg, label, args, Hyperion){
    if(label === "help"){

    }
    const command = findCommand(label, Hyperion);


}


//handles dev command execution
async function _devCommandHandler(msg, label, args, Hyperion){
    const command = findCommand(label, Hyperion);
    if(!command){
        return;
    }
    return command.execute(msg, args, Hyperion);
}

//main handler function
async function handleCommand(msg, Hyperion){

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
    if((msg.author.id === Hyperion.config.owner) && (msg.content.startsWith(Hyperion.config.devPrefix))){
        const args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        const label = cmdLabelar[0].slice(Hyperion.config.devPrefix.length).toLowerCase();
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
    if(msg.member.bot){
        return false;
    }
    if(Hyperion.blacklist.includes(msg.member.id)){
        return false;
    }

    //ensures the guild has an entry in the db, and creates one otherwise
    const registered = await Hyperion.guildModel.exists({ guildID: msg.channel.guild.id});
    if(!registered){
        await Hyperion.registerGuild(msg.channel.guild);
    }
    return true;
}

async function commandList(Hyperion){
    return Hyperion.commands.filter(com => ((com.commandType !== "dev") && (com.commandType !== "internal")))
}

const handler = {
    find: findCommand,
    lsit: commandList,
    handle: handleCommand
};
exports = handler;