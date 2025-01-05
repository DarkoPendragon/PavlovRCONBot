exports.run = function(client, message, args) {
    if (!args[0]) return message.reply(`You need to give me a user to kill!`)
    client.RCONCommandHandler(client._socket, `Kill ${args[0]}`, [], message.author).then(res => {
        res = JSON.parse(res)
        if (res.Kill && res.Kill == true) message.react('✔️')
        else message.react('❌')
    })
};

exports.conf = {
    enabled: true,
    serverOnly: false,
    allowedServers: [],
    aliases: ['kl'],
    permLevel: 1
};

exports.help = {
    type: 'moderator',
    name: 'kill',
    requireLog: false,
    description: 'Kills a user in the Pavlov server.',
    usage: 'kill [pavlov username]'
};