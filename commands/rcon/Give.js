exports.run = async (client, opt, soc, msg) => {
    if (!client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.add(msg.author.id)

    const VALID_ITEMS = client.VALID_ITEMS;
    const LOADOUTS = {
        trait: ["newtonlauncher", "tttknife", "Syringe", "Syringe", "Painkillers", "taser", "Armour", "kevlarhelmet"],
        detective: ["detectivesmg", "Armour", "kevlarhelmet", "Painkillers", "ammo_special", "ammo_special", "ammo_smg", "ammo_smg"],
        cletus: ["newtonlauncher", "goldengun", "Knife", "Armour", "tttc4", "tttc4", "tttc4"],
        troll: ["Syringe", "Syringe", "Syringe", "Syringe", "Knife"]
    }
    let passed = false;
    client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(res => {
        let PLAYERS = JSON.parse(res).PlayerList
        if (!PLAYERS || PLAYERS.length == 0) {
            if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
            return msg.reply("No players online!")
        }
        let PLS = PLAYERS.map((p, i) => {
            return { UniqueId: p.UniqueId, Username: p.Username, number: i }
        })
        msg.channel.send(`\`\`\`\nONLINE PLAYERS (GIVE) ((Number) Username : ID)\n${PLS.map(p => `(${p.number}) ${p.Username} : ${p.UniqueId}`).join("\n")}\n\`\`\``)
        const msg_filter = m => m.author.id == msg.author.id;
        const msg_collector = msg.channel.createMessageCollector({ filter: msg_filter, time: 3600000 });
        msg_collector.on('collect', async (m) => {
            if (!passed) {
                try {
                    let num = m.content;
                    if (num) {
                        let player = PLS.filter(p => p.number == num)[0];
                        if (player) {
                            passed = true;
                            const EMSG = await msg.channel.send(`What item would you like to give?`)
                            msg.channel.awaitMessages({ filter: (m) => m.author.id == msg.author.id, max: 1, time: 60000, errors: ['time'] })
                                .then(async (res) => {
                                    client.isWaitingInput.delete(msg.author.id)
                                    if (res.size) res = res.first()
                                    let cont = res.content.includes("|") ? res.content.split("|") : res.content
                                    if (typeof cont == 'object') {
                                        let item = cont[0]
                                        let items = []
                                        for (var i = cont[1]-1; i >= 0; i--) {
                                            items.push(item)
                                        }
                                        client.queue.push({ cmd: "GiveItem", userID: player.UniqueId, params: items, repeat: true, ranBy: msg.author })
                                    } else {
                                        if (VALID_ITEMS.includes(cont)) {
                                            client.RCONCommandHandler(soc, `GiveItem ${player.UniqueId} ${cont.trim()}`, [], msg.author).then(res => {
                                                res = JSON.parse(res)
                                                if (res.GiveItem && res.GiveItem == true) EMSG.edit(`${player.Username} given ${cont.trim()}.`)
                                                else EMSG.edit(`${player.Username} not given any items (returned false).`)
                                                msg_collector.stop()
                                            })
                                        } else if (LOADOUTS[cont]) {
                                            client.queue.push({ cmd: "GiveItem", userID: "Father.Cletus", params: LOADOUTS[cont], repeat: true, ranBy: msg.author })
                                            EMSG.edit(`${player.Username} given ${cont.trim()}.`)
                                            msg_collector.stop()
                                        }
                                    }
                                })
                                .catch((res) => {
                                    msg_collector.stop()
                                });
                        } else {
                            passed = true;
                            msg.channel.send("Invalid number")
                            msg_collector.stop()
                        }
                    } else {
                        passed = true;
                        msg.reply("you need a number")
                        msg_collector.stop()
                    }

                } catch (e) {
                    console.log(e)
                    msg_collector.stop()
                }
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
    name: "Give",
    view: "Give",
    desc: "Fetches the current players connected to the server and list them for item giving."
};