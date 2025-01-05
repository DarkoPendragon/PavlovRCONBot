const Discord = require('discord.js');
module.exports = async (client, message) => {
    if (message.author.bot || message.system) return;
    let prefix = client.conf.prefix
    if (message.channel.type == 'text' && message.content.startsWith(prefix)) {
        let name = message.content.split(prefix)[1].split(" ")[0]
    	const command = client.commands.filter(c => c.help.name == name && c.help.type != 'RCON').first();
        const args = prefix.includes(" ") ? message.content.split(' ').slice(2) : message.content.split(' ').slice(1);
        const perms = client.elevation(message);
        if (command) {
        	if (command.conf.permLvl > perms) return;
        	try {
        		command.run(client, message, args)
        	} catch (e) {
        		console.log(e)
        	}
        }
    } else {
        if (message.channel.type == 'dm' && client.conf.runningChannel == "DM") {
            if (client.isWaitingInput.has(message.author.id)) return;
            if (!client.conf.allowAllUsers && !client.conf.allowedUsers.includes(message.author.id)) return;
            let command = message.content.split(" ")[0].trim()
            let cmd = client.commands.filter(c => c.help.type == 'RCON' && c.help.name == command).first()
            if (cmd) client.RCONCmd(command, {}, client._socket, message).catch(r => message.reply(`\`\`\`\n${r}\n\`\`\``))
            else {
                client.RCONCommandHandler(client._socket, message.content, [], message.author).then(async res => {
                    res = JSON.parse(res)
                    let entries = Object.entries(res)
                    if (entries.length > 25) {
                        message.reply(`\`\`\`json\n${JSON.stringify(res, null, 2)}\n\`\`\``)
                    } else {
                        const embed = new Discord.MessageEmbed()
                            .setTitle('Command Retrun Data')
                            .setColor('GREEN')
                        entries.forEach(([key, value]) => {
                            key = JSON.stringify(key).replace(/"/g, "")
                            embed.addField(key, `\`\`\`json\n${typeof value == 'string' ? value : JSON.stringify(value, null, 2)}\n\`\`\``, true)
                        })
                        message.reply({ embed: embed })
                    }
                }).catch(res => {
                    console.log(res)
                    message.reply(`Failed Command\n\`\`\`\n${JSON.stringify(res, null, 2)}\n\`\`\``)
                })
            }
        } else if (message.channel.type == 'text') {
            if (client.isWaitingInput.has(message.author.id)) return;
            if (message.channel.id != client.conf.runningChannel) return;
            let perms = client.elevation(message)
            let command = message.content.split(" ")[0].trim()
            let cmd = client.commands.filter(c => c.help.type == 'RCON' && c.help.name == command).first()
            if (cmd) client.RCONCmd(command, {}, client._socket, message).catch(r => message.reply(`\`\`\`\n${r}\n\`\`\``))
            else {
                client.RCONCommandHandler(client._socket, message.content, [], message.author).then(async res => {
                    res = JSON.parse(res)
                    let entries = Object.entries(res)
                    if (entries.length > 25) {
                        message.reply(`\`\`\`\n${JSON.stringify(res, null, 2)}\n\`\`\``)
                    } else {
                        const embed = new Discord.MessageEmbed()
                            .setTitle('Command Retrun Data')
                            .setColor('GREEN')
                        entries.forEach(([key, value]) => {
                            key = JSON.stringify(key).replace(/"/g, "")
                            embed.addField(key, `\`\`\`json\n${typeof value == 'string' ? value : JSON.stringify(value, null, 2)}\n\`\`\``, true)
                        })
                        message.reply({ embed: embed })
                    }
                }).catch(res => {
                    console.log(res)
                    message.reply(`Failed Command\n\`\`\`\n${JSON.stringify(res, null, 2)}\n\`\`\``)
                })
            }
        }
    }
}