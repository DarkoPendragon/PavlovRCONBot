exports.run = function(client, message, args) {
    client.RCONCommandHandler(client._socket, 'RefreshList', [], message.author).then(res => {
        let PLAYERS = JSON.parse(res).PlayerList
        let PLS = PLAYERS.map(p => `${p.Username}${" ".repeat(25 - p.Username.length)}: ${p.UniqueId}`)
        message.reply(`\`\`\`\nONLINE PLAYERS (Username : ID)\n${PLS.join("\n")}\n\`\`\``)
    })
};

exports.conf = {
    enabled: true,
    serverOnly: false,
    allowedServers: [],
    aliases: ['players'],
    permLevel: 0
};

exports.help = {
    type: 'utility',
    name: 'list',
    requireLog: false,
    description: 'Lists the number of players on the server and names.',
    usage: 'list'
};