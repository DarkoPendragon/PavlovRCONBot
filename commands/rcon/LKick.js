exports.run = async (client, opt, soc, msg) => {
    if (!client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.add(msg.author.id)
    client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(res => {
        let PLAYERS = JSON.parse(res).PlayerList
        if (!PLAYERS || PLAYERS.length == 0) {
            if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
            return msg.reply("No players online!")
        }
        let PLS = PLAYERS.map((p, i) => {
            return { UniqueId: p.UniqueId, Username: p.Username, number: i }
        })
        msg.channel.send(`\`\`\`\nONLINE PLAYERS (KICK) ((Number) Username : ID)\n${PLS.map(p => `(${p.number}) ${p.Username} : ${p.UniqueId}`).join("\n")}\n\`\`\``)
        const msg_filter = m => m.author.id == msg.author.id;
        const msg_collector = msg.channel.createMessageCollector({ filter: msg_filter, time: 3600000 });
        msg_collector.on('collect', m => {
            try {
                let num = m.content;
                if (num) {
                    let player = PLS.filter(p => p.number == num)[0];
                    if (!player) {
                        msg.channel.send("Invalid number")
                        msg_collector.stop()
                    } else {
                        client.RCONCommandHandler(soc, `Kick ${player.UniqueId}`, [], msg.author).then(res => {
                            res = JSON.parse(res)
                            if (res.Kick && res.Kick == true) msg.channel.send(`Player ${player.UniqueId} Kicked`)
                            else msg.channel.send(`Player ${player.UniqueId} not kicked. This is likely because they left the server already.`)
                            msg_collector.stop()
                        })
                    }
                } else {
                    msg.reply("you need a number")
                    msg_collector.stop()
                }

            } catch (e) {
                console.log(e)
                msg_collector.stop()
            }
        })
        msg_collector.on('end', r => {
            if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
        })
    })
}

exports.conf = {
    enabled: true,
    permLevel: 0
};

exports.help = {
    type: "RCON",
    name: "LKick",
    view: "LKick",
    desc: "Fetches the current players connected to the server and list them to kick."
};