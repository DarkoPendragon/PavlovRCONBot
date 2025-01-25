exports.run = async (client, opt, soc, msg) => {
    if (!client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.add(msg.author.id)
    const VALID_ITEMS = client.VALID_ITEMS;
    const LOADOUTS = {
        trait: ["newtonlauncher", "tttknife", "Syringe", "Syringe", "Painkillers", "taser", "Armour", "kevlarhelmet"],
        detective: ["detectivesmg", "Armour", "kevlarhelmet", "Painkillers", "ammo_smg"],
        cletus: ["newtonlauncher", "goldengun", "Knife", "Armour", "tttc4", "tttc4", "tttc4"],
        troll: ["Syringe", "Syringe", "Syringe", "Syringe", "Knife"]
    }

    var TMSG = await msg.channel.send(`What item would you like to give? Use reactions for loadouts.\nVALIDITEMS:\n\`\`\`\nVALIDITEMS: ${client.VALID_ITEMS.join(", ")}\n\`\`\` `)
    var TRAIT = await TMSG.react('🥵').then(r => {
        const TRAIT_FILTER = (reaction, user) => reaction.emoji.name == r._emoji.name && user.id == msg.author.id;
        soc._TRAIT_COLLECT = TMSG.createReactionCollector(TRAIT_FILTER, { time: 3600000, max: 6 })
        soc._TRAIT_COLLECT.on("collect", r => {
            client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(async (res) => {
                const playerList = JSON.parse(res)
                if (res && playerList) {
                    const players = playerList.PlayerList.map(p => p.UniqueId)
                    players.forEach(p => {
                        console.log(`Issuing Loadout GiveAll for ${p}`)
                        client.queue.push({ cmd: "GiveItem", userID: p, params: LOADOUTS.trait, repeat: true, ranBy: msg.author })
                    })
                }
            })
        })
        soc._TRAIT_COLLECT.on("end", r => {
            if (!TMSG.deleted) TMSG.edit(TMSG.content.replace("TRAIT_AV", "~~**TRAIT_UN**~~"))
        })
    })
    var DETECTIVE = await TMSG.react('🤑').then(r => {
        const DETECTIVE_FILTER = (reaction, user) => reaction.emoji.name == r._emoji.name && user.id == msg.author.id;
        soc._DETECTIVE_COLLECT = TMSG.createReactionCollector(DETECTIVE_FILTER, { time: 3600000, max: 6 })
        soc._DETECTIVE_COLLECT.on("collect", r => {
            client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(async (res) => {
                const playerList = JSON.parse(res)
                if (res && playerList) {
                    const players = playerList.PlayerList.map(p => p.UniqueId)
                    players.forEach(p => {
                        console.log(`Issuing Loadout GiveAll for ${p}`)
                        client.queue.push({ cmd: "GiveItem", userID: p, params: LOADOUTS.detective, repeat: true, ranBy: msg.author })
                    })
                }
            })
        })
        soc._DETECTIVE_COLLECT.on("end", r => {
            if (!TMSG.deleted) TMSG.edit(TMSG.content.replace("DETECTIVE_AV", "~~**DETECTIVE_UN**~~"))
        })
    })
    var CLETUS = await TMSG.react('🤪').then(r => {
        const CLETUS_FILTER = (reaction, user) => reaction.emoji.name == r._emoji.name && user.id == msg.author.id;
        soc._CLETUS_COLLECT = TMSG.createReactionCollector(CLETUS_FILTER, { time: 3600000, max: 6 })
        soc._CLETUS_COLLECT.on("collect", r => {
            client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(async (res) => {
                const playerList = JSON.parse(res)
                if (res && playerList) {
                    const players = playerList.PlayerList.map(p => p.UniqueId)
                    players.forEach(p => {
                        console.log(`Issuing Loadout GiveAll for ${p}`)
                        client.queue.push({ cmd: "GiveItem", userID: p, params: LOADOUTS.cletus, repeat: true, ranBy: msg.author })
                    })
                }
            })
        })
        soc._CLETUS_COLLECT.on("end", r => {
            if (!TMSG.deleted) TMSG.edit(TMSG.content.replace("CLETUS_AV", "~~**CLETUS_UN**~~")).catch(console.log)
        })
    })
    const msg_filter = m => m.author.id == msg.author.id;
    const msg_collector = msg.channel.createMessageCollector({ filter: msg_filter, time: 3600000 });
    msg_collector.on('collect', async m => {
        let item = m.content.includes("|") ? m.content.split("|")[0].trim().replace(/\s/g, '') : m.content.trim().replace(/\s/g, '')
        if (m.content.includes("|")) {
            let items = []
            for (var i = m.content.split("|")[1]; i >= 0; i--) {
                items.push(item)
            }
            client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(async (res) => {
                let pls = JSON.parse(res)
                if (res && pls) {
                    let pls_players = pls.PlayerList.map(p => p.UniqueId)
                    pls_players.forEach(p => {
                        console.log(`Issuing GiveAll for ${p}`)
                        client.queue.push({ cmd: "GiveItem", userID: p, params: items, repeat: true, ranBy: msg.author })
                    })
                    msg_collector.stop("issued giveall single")
                }
            }).catch(() => {
                try {
                    msg_collector.stop()
                } catch (e) {
                    if (soc._TRAIT_COLLECT) soc._TRAIT_COLLECT.stop()
                    if (soc._DETECTIVE_COLLECT) soc._DETECTIVE_COLLECT.stop()
                    if (soc._CLETUS_COLLECT) soc._CLETUS_COLLECT.stop()
                    if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
                }
            })
        } else {
            if (VALID_ITEMS.includes(item)) {
                client.RCONCommandHandler(soc, 'RefreshList', [], msg.author).then(async (res) => {
                    let pls = JSON.parse(res)
                    if (res && pls) {
                        let pls_players = pls.PlayerList.map(p => p.UniqueId)
                        pls_players.forEach(p => {
                            console.log(`Issuing GiveAll for ${p}`)
                            client.queue.push({ cmd: "GiveItem", userID: p, params: [item], ranBy: msg.author })
                        })
                        msg_collector.stop("issued giveall single")
                    }
                }).catch(() => {
                    try {
                        msg_collector.stop()
                    } catch (e) {
                        if (soc._TRAIT_COLLECT) soc._TRAIT_COLLECT.stop()
                        if (soc._DETECTIVE_COLLECT) soc._DETECTIVE_COLLECT.stop()
                        if (soc._CLETUS_COLLECT) soc._CLETUS_COLLECT.stop()
                        if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
                    }
                })
            } else {
                if (m.content == 'STOP') msg_collector.stop()
                else msg.reply("invalid item!")
            }
        }
    })
    msg_collector.on('end', m => {
        if (soc._TRAIT_COLLECT) soc._TRAIT_COLLECT.stop()
        if (soc._DETECTIVE_COLLECT) soc._DETECTIVE_COLLECT.stop()
        if (soc._CLETUS_COLLECT) soc._CLETUS_COLLECT.stop()
        if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
    })
}

exports.conf = {
    enabled: true,
    permLevel: 0
};

exports.help = {
    type: "RCON",
    name: "GiveAll",
    view: "GiveAll",
    desc: "Gives all connected players an item or set of items."
};