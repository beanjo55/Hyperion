




//finds the command object specified by the search
function findCommand(search, Hyperion){
    return Hyperion.commands.find(com => (com.name === search) || (com.aliases.includes(search)));
}


//checks if command is dev or internal, and if it should be shown/executed
function checkInternal(member, command){

}


//check if the executing user is on the required user list
function checkRequiredUsers(member, command){

}


//handles normal command execution
async function _commandHandler(msg, label, args, Hyperion){

}


//handles dev command execution
async function _devCommandHandler(msg, label, args, Hyperion){
    const command = findCommand(label, Hyperion);
    if(!command){
        return;
    }
    command.execute(msg, args, Hyperion);
}

//main handler function
async function handleCommand(msg, Hyperion){

    if(!_preHandle(msg, Hyperion)){
        return;
    }

    const result = await _prefixHandle(msg, Hyperion);
    if(result[0] === "none"){
        return;
    }

    if(result[0] === "dev"){
        await _devCommandHandler(msg, result[1], result[2], Hyperion);
    }

    if(result[0] === "normal"){
        await _commandHandler(msg, result[1], result[2], Hyperion);
    }

}


//detect and isolate normal prefix and args
async function _prefixHandle(msg, Hyperion){
    if((msg.author.id === Hyperion.config.owner) && (msg.content.startsWith(Hyperion.config.devPrefix))){
        const args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        const label = cmdLabelar[0].slice(Hyperion.config.devPrefix.length).toLowerCase();
        return ["dev", label, args];
    }
    const aprefix = await Hyperion.models.guild.findOne({'guildID': msg.channel.guild.id}, 'prefix').exec();
    let prefix = aprefix.prefix[0];
    if(msg.content.startsWith(prefix)){
        const args = msg.content.split(" ").slice(1);
        const cmdLabelar = msg.content.split(" ").slice(0, 1);
        const label = cmdLabelar[0].slice(prefix.length).toLowerCase();
        return ["normal", label, args];
    }
    let contentClean = msg.content.replace(/<@!/g, "<@");
    if(contentClean.startsWith(Hyperion.user.mention)){
        const args = msg.content.split(" ").slice(2);
        const cmdLabelar = contentClean.split(" ").slice(1, 2);
        const label = cmdLabelar[0].trim().toLowerCase();
        return ["normal", label, args];
    }
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
    const registered = await Hyperion.guildModel.exists({ guildID: msg.channel.guild.id});
    if(!registered){
        await Hyperion.registerGuild(msg.channel.guild);
    }
    return true;
}