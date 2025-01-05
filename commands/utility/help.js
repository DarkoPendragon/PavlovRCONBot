const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args[0]) {
        const perms = client.elevation(message);
        var cats = new Map();
        client.commands.forEach(c => {
            if (c.conf.enabled == true && perms >= c.conf.permLevel) {
                let n = c.help.type;
                if (!cats.has(n)) {
                    cats.set(n, {
                        name: n,
                        array: []
                    });
                };
                cats.get(n).array.push(c.help.name);
            }
        });

        var embed = new Discord.MessageEmbed();
        embed.setTitle(`Commands Info`)
        embed.setDescription(`Use \`${client.conf.prefix}help commandname\` to view help on a command (use in a server). You have **class ${perms}** access.`)
        cats.forEach(cat => {
            embed.addField(cat.name, cat.array.join(", "));
        });
        embed.setColor('RANDOM')
        embed.setTimestamp()
        embed.setThumbnail(client.user.avatarURL());
        message.author.send({ embeds: [embed] }).catch(() => {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`Commands Info`)
            embed.setDescription(`Use \`${client.conf.prefix}help commandname\` to view help on a command (use in a server). You have **class ${perms}** access.`)
            cats.forEach(cat => {
                embed.addField(cat.name, cat.array.join(", "));
            });
            embed.setColor('RANDOM')
            embed.setTimestamp()
            embed.setThumbnail(client.user.avatarURL())
            return message.channel.send({ embeds: [embed] }).catch(console.error);
        });
    } else {
        let command = args.slice(0).join(' ');
        if (client.commands.has(command)) {
            let perms = client.elevation(message);
            command = client.commands.get(command);
            console.log(command)
            if (perms < command.conf.permLevel) return message.reply(`Sorry, your access level is too low for this!`).then(msg => msg.delete({ timeout: 10000 }));

            const embed = new Discord.MessageEmbed();
            embed.setTitle(command.help.name)
            embed.setDescription(`${command.help.description || command.help.desc}`)
            embed.setColor(0x610161)
            embed.setTimestamp()
            if (command.help.usage) embed.addField('Usage:', `${client.conf.prefix}${command.help.usage}`)
            embed.setThumbnail(client.user.avatarURL())
            if (command.help.type == 'RCON') embed.setFooter('RCON commands only run in the RCON channel!')
            return message.channel.send({ embeds: [embed] }).catch(console.error);
        } else {
            message.reply(`please give me a valid command!`);
        }
    };
};

exports.conf = {
    enabled: true,
    serverOnly: false,
    allowedServers: [],
    aliases: ['h', 'halp', 'commands', 'cmds'],
    permLevel: 0
};

exports.help = {
    type: 'utility',
    name: 'help',
    requireLog: false,
    description: 'Displays all the available commands for your access level or displays help for a command.',
    usage: 'help [command]'
};