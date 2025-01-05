exports.run = function(client, message, args) {
    if (!args[0]) return message.reply(`You need to give me a user to ban!`)
    client.RCONCommandHandler(client._socket, `Ban ${args[0]}`, [], message.author).then(res => {
        res = JSON.parse(res)
        if (res.Kick && res.Kick == true) message.reply(`Player \`${args[0]}\` banned.`)
        else message.reply(`Player \`${args[0]}\` not banned. Remember, names are case-sensitive!`)
    })
};

exports.conf = {
    enabled: true,
    serverOnly: false,
    allowedServers: [],
    aliases: ['b'],
    permLevel: 1
};

exports.help = {
    type: 'moderator',
    name: 'ban',
    requireLog: false,
    description: 'Bans a user from the Pavlov server.',
    usage: 'ban [pavlov username]'
};