const { MessageEmbed } = require('discord.js')
exports.run = async (client, opt, soc, msg) => {
    let args = msg.content.split(" ");
    function send() {
        let embed = new MessageEmbed()
            .setTitle("RCON Custom Commands")
            .setColor('RANDOM')
            .setDescription(`${client.commands.map(c => `\`${c.help.name}\``).join(", ")}`)
            .setFooter("These runs without a prefix, in the RCON channel(s)!")
        msg.channel.send({ embed: embed })
    }
    if (args[1]) {
        let cmd = client.commands.filter(c => c.help.name == args[1] || c.help.view == args[1])[0]
        if (!cmd) return send()
        let embed = new MessageEmbed()
            .setTitle(`RCON Custom - ${cmd.help.name}`)
            .setColor('RANDOM')
            .setDescription(cmd.help.desc)
            .setFooter("This runs without a prefix, in the RCON channel(s)!")
            Object.entries(cmd.help).forEach(([key, value]) => {
            	key = JSON.stringify(key).replace(/"/g, "")
                if (key != "desc") embed.addField(key, `${typeof value == 'string' ? value : JSON.stringify(value)}`, true)
            })
            msg.reply({embed: embed})
    } else {
    	send()
    }
}

exports.conf = {
    enabled: true,
    permLevel: 0
};

exports.help = {
    type: "RCON",
    name: "Commands",
    view: "Commands",
    desc: "Lists custom commands loaded."
};