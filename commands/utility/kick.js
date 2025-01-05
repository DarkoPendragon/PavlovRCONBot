exports.run = function(client, message, args) {
    if (!args[0]) return message.reply(`You need to give me a user to kick!`)
    client.RCONCommandHandler(client._socket, `Kick ${args[0]}`, [], message.author).then(res => {
        res = JSON.parse(res)
        if (res.Kick && res.Kick == true) message.reply(`Player \`${args[0]}\` Kicked`)
        else message.reply(`Player \`${args[0]}\` not kicked. Remember, names are case-sensitive!`)
    })
};

exports.conf = {
    enabled: true,
    serverOnly: false,
    allowedServers: [],
    aliases: ['k'],
    permLevel: 1
};

exports.help = {
    type: 'moderator',
    name: 'kick',
    requireLog: false,
    description: 'Kicks a user from the Pavlov server.',
    usage: 'kick [pavlov username]'
};