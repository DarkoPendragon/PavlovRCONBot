const { MessageEmbed } = require('discord.js')
exports.run = async (client, opt, soc, msg) => {
    if (!client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.add(msg.author.id)
    client.RCONCommandHandler(soc, `MapList`, [], msg.author).then(async (res) => {
        let r = JSON.parse(res)
        if (r && r.MapList) {
            let MAPS = r.MapList.map((m, i) => {
                return { map: m.MapId, mode: m.GameMode, num: i }
            })
            const embed = new MessageEmbed()
                .setTitle("Map Change Comand")
                .setDescription(`${MAPS.map(m => `(**${m.num}**) __**${m.map}**__ ${m.mode}`).join("\n")}`)
                .setFooter(`Say "STOP" to stop selection!`)
                .setColor('RANDOM')
            const TMSG = await msg.channel.send({ embeds: [embed] })
            const msg_filter = m => m.author.id == msg.author.id;
            const msg_collector = msg.channel.createMessageCollector({ filter: msg_filter, time: 3600000 });
            msg_collector.on('collect', (m) => {
                let map = MAPS.filter(s => s.num == m.content)[0]
                if (map) {
                    client.RCONCommandHandler(soc, `SwitchMap ${map.map} ${map.mode}`, [], msg.author).then((res) => {
                        let r = JSON.parse(res)
                        if (r.SwitchMap == true) TMSG.edit(`Switched server map to ${map.map} (${map.mode})`)
                        msg_collector.stop()
                    })
                } else {
                    if (m.content == 'STOP') msg_collector.stop()
                    else msg.reply("Invalid map number!")
                }
            })
            msg_collector.on('end', () => {
                if (client.isWaitingInput.has(msg.author.id)) client.isWaitingInput.delete(msg.author.id)
            })
        } else {
            return msg.reply("Couldn't fetch any maps!")
        }
    })
}

exports.conf = {
    enabled: true,
    permLevel: 0
};

exports.help = {
    type: "RCON",
    name: "Map",
    view: "Map",
    desc: "Gives a list of maps to choose to change from (used the servers map rotation)."
};