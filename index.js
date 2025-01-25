const Discord = require('discord.js')
const klaw = require('klaw')
const path = require('path')
const net = require('net')
class RCON extends Discord.Client {
    constructor(options) {
        super(options)
        this._socket = null
        this.isAuth = false
        this.isWaitingInput = new Set()
        this.queue = []
        this.intervals = {}
        this.VALID_CMDS = []
        this.VALID_ITEMS = []
        this.MAP_LIST = []
        this.commands = new Discord.Collection()
        this.aliases = new Discord.Collection()
        this.wait = require("util").promisify(setTimeout)
        this.conf = require('./config.json')
        this.fallbacks = {
            Help: ""
        }
    }

    // this is used when a user logs into the website
    userLoggedIn(user, invalid) {
        // you can do whatever with this
        // a basic user object is passed for 'user' and invalid is 'true' if they failed to auth
        // the user object passed: (it is a partial version of the below link)
        // https://old.discordjs.dev/#/docs/discord.js/13.14.0/class/User
        //
        // example of the info you'll get:
        // {
        //     "id": "Discord User ID",
        //     "username": "Discord Account Username",
        //     "avatar": "avatarFileHash",
        //     "discriminator": "Discord Account Discriminator", (not used, but still exist in d.js v13)
        //     "public_flags": 0,
        //     "flags": 0,
        //     "banner": null,
        //     "banner_color": null,
        //     "accent_color": null,
        //     "locale": "en-US",
        //     "mfa_enabled": true
        // }
    }

    // updateEmbedInfo(data) {
    //     let info = JSON.parse(data)
    //     this.channels.fetch(this.conf.updateChannel).then((res) => {
    //         res.edit({ name: `Players: ${d.PlayerList.length}/${res.name.split("/")[1]}` }).catch(console.log)
    //     }).catch(console.log)
    // }

    RCON_INTER_FUNCTION(cli) {
        if (!cli || !cli.rcon) return false
        if (cli && cli.queue) {
            if (cli.queue.length > 0) {
                cli.RCON_READ_ORDER()
            }
        }
    }

    RCON_READ_ORDER() {
        const cli = this;
        if (cli.queue.length > 0) {
            clearInterval(cli.intervals.QUEUE_INTER)
            let THIS_ORDER = cli.queue[0]
            cli.queue.shift()
            console.log(`Shifted, running issued queue order: ${THIS_ORDER.cmd} ${THIS_ORDER.userID} (${THIS_ORDER.params ? THIS_ORDER.params.join(" ") : "NOPARAMS"})`)

            if (THIS_ORDER.params) {
                if (THIS_ORDER.params.length > 1) {
                    let items = THIS_ORDER.params
                    var inter = 0

                    function next() {
                        if (inter !== items.length) {
                            let item = items[inter]
                            if (cli.VALID_ITEMS.includes(item)) cli.RCONCommandHandler(cli._socket, `${THIS_ORDER.cmd} ${THIS_ORDER.userID} ${item}`, [], THIS_ORDER.ranBy).catch(res => console.log('Problem running queue order: ' + res.stack ? res.stack : res))
                            inter = inter + 1
                            setTimeout(() => { next() }, 200)
                        } else {
                            cli.intervals.QUEUE_INTER = setInterval(() => cli.RCON_INTER_FUNCTION(cli), cli.conf.intervalSpeed)
                        }
                    }
                    next()
                } else {
                    cli.RCONCommandHandler(cli._socket, `${THIS_ORDER.cmd} ${THIS_ORDER.userID} ${THIS_ORDER.params[0]}`, [], THIS_ORDER.ranBy).catch(res => console.log('Problem running queue order: ' + res.stack ? res.stack : res))
                    cli.intervals.QUEUE_INTER = setInterval(() => cli.RCON_INTER_FUNCTION(cli), cli.conf.intervalSpeed)
                }
            } else {
                cli.RCONCommandHandler(cli._socket, `${THIS_ORDER.cmd} ${THIS_ORDER.userID}`, [], THIS_ORDER.ranBy).catch(res => console.log('Problem running queue order: ' + res.stack ? res.stack : res))
                cli.intervals.QUEUE_INTER = setInterval(() => cli.RCON_INTER_FUNCTION(cli), cli.conf.intervalSpeed)
            }
        }
    }

    RCONCommandHandler(socket, command, params, user) {
        return new Promise(async (resolve, reject) => {
            try {
                let cmd = this.VALID_CMDS.filter(x => x.toLowerCase() == command.split(" ")[0].toLowerCase())[0]
                if (!cmd && command.toLowerCase() != 'help') throw new Error("invalid command " + command)
                if (socket.destroyed || !socket.readyState) {
                    await this._socket.connect(this.conf.server.port, this.conf.server.serverIP, () => {});
                    await this.wait(2000)
                }
                socket.write(command)
                socket.once('data', async (data) => {
                    try {
                        data = Buffer.from(data, 'base64').toString('ascii')
                        if (data.toString().startsWith('Password:')) {
                            await this.wait(1200)
                            socket.write(command)
                            socket.once('data', async (data) => {
                                if (user) this.RCONLog(data.toString(), { cmd: command, cmdName: command.split(" ")[0], user: { name: user.username, avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` } });
                                else this.RCONLog(data.toString(), { cmd: command })
                                resolve(data.toString())
                            })
                        } else {
                            // if (command == "RefreshList") this.updateEmbedInfo(data) // allow users to post a list of people online in Discord
                            if (user) this.RCONLog(data, { cmd: command, cmdName: command.split(" ")[0], user: { name: user.username, avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` } });
                            else this.RCONLog(data, { cmd: command })
                            resolve(data)
                        }
                    } catch (e) {
                        if (e.toString().includes('Unexpected end of JSON') || e.toString().includes('Unexpected token')) {
                            this.sentData = true
                            console.log(data)
                        }
                        console.log("RCONHANDLE", e)
                    }

                });
            } catch (e) {
                console.log(e)
                reject(e)
            }
        })
    }

    async spinServer() {
        return new Promise((resolve, reject) => {
            let CLI = this;
            let socket = net.Socket();
            socket.connect(this.conf.server.port, this.conf.server.serverIP, () => {});
            socket.on('error', (err) => {
                if (err.toString().includes('This socket has been ended by the other party')) {
                    this.authServer(socket).then(console.log).catch(console.log)
                } else {
                    console.log(err)
                    reject(err)
                }
            });
            socket.on('data', async (data) => {
                if (data.toString().startsWith('Password:')) {
                    let password = require('crypto').createHash('md5').update(this.conf.server.password).digest('hex');
                    socket.write(password)
                    console.log(data.toString())
                }
                if (data.toString().startsWith('Authenticated=1')) {
                    this.isAuth = true;
                    socket.emit("authServer", true)
                    console.log('Logged in!')
                    resolve(socket)
                    if (!this.intervals.QUEUE_INTER) this.intervals.QUEUE_INTER = setInterval(() => this.RCON_INTER_FUNCTION(CLI), CLI.conf.intervalSpeed);
                    if (this.VALID_CMDS.length == 0) this.RCONCommandHandler(socket, `Help`).then(async (res) => {
                        let dres = JSON.parse(res)
                        this.fallbacks.Help = res;
                        let mds = dres.Help.map(c => c.split(" ")[0])
                        this.VALID_CMDS = mds;
                        this.started = true;
                    })
                    if (this.VALID_ITEMS.length == 0) {
                        if (this.VALID_CMDS.length == 0) await this.wait(1000)
                        this.RCONCommandHandler(socket, 'ItemList').then(r => {
                            try {
                                let dt = JSON.parse(r)
                                this.VALID_ITEMS = dt.ItemList
                            } catch (e) {
                                if (r.trim().endsWith("}")) {
                                    if (r.ItemList) this.VALID_ITEMS = r.ItemList
                                    else {
                                        let dt = JSON.parse(JSON.stringify(r))
                                        this.VALID_ITEMS = dt.ItemList
                                    }
                                } else {
                                    console.log(r)
                                    let dt = JSON.parse(r + "]}")
                                    this.VALID_ITEMS = dt.ItemList
                                }
                            }
                        })
                    }
                    if (!this.MAP_LIST || this.MAP_LIST.length == 0) {
                        await this.wait(1000)
                        client.RCONCommandHandler(socket, `MapList`).then(res => {
                            let r = JSON.parse(res)
                            if (r && r.MapList) {
                                this.MAP_LIST = r.MapList
                            }
                        })
                    }
                    if (!this.intervals.playerRefreshInter || this.intervals.playerRefreshInter._destroyed) this.intervals.playerRefreshInter = setInterval(async () => {
                        if (CLI.isWaitingInput.size == 0 && CLI.queue.length == 0) {
                            if (CLI.logging) console.log("Checking for players")
                            CLI.RCONCommandHandler(socket, 'RefreshList').then((res) => {
                                res = JSON.parse(res).PlayerList;
                                if (res.length == 0) {
                                    socket.destroy()
                                    console.log("No players, socket destroyed")
                                    clearInterval(CLI.intervals.playerRefreshInter)
                                    Object.entries(CLI.intervals).forEach(int => {
                                        if (!int._destroyed) clearInterval(int)
                                    })
                                }
                            }).catch(console.log)
                        }
                    }, 60000)
                }
                if (data.toString().startsWith('Authenticated=0')) {
                    this.isAuth = false;
                    socket.emit("authServer", false)
                    reject(new Error("login wrong, couldnt auth"))
                }
            })
            socket.on('authServer', r => {
                this.isAuth = r
            })
        })
    }

    authServer(socket) {
        return new Promise(async (resolve, reject) => {
            if (!socket || socket.pending || !socket.readyState || socket.connecting) {
                await this.wait(1000)
                if (!socket || socket.connecting) reject("socket either doesnt exist or isnt ready yet")
            }
            if (socket.destroyed) {
                socket.connect(this.conf.server.port, this.conf.server.serverIP, () => {});
                socket.once("authServer", async (state) => resolve(state))
            } else {
                if (this.conf.extraLogging) console.log("Forcing re-auth in authServer...")
                await socket.write("disconnect")
                await socket.destroy()
                await this.wait(1000)
                socket.connect(this.conf.server.port, this.conf.server.serverIP, () => {});
                socket.once("authServer", async (state) => resolve(state))
            }
        })
    }

    RCONCmd(cmd, options, socket, message) {
        return new Promise(async (resolve, reject) => {
            if (this.isWaitingInput.has(message.author.id)) reject("isWaitingInput")
            let c = this.commands.filter(c => c.help.type == 'RCON' && c.help.name == cmd).first()
            if (!c) reject("noCmd")
            try {
                c.run(this, options, socket, message)
                resolve()
            } catch (e) {
                reject("CMD Failed: ", e)
            }
        })
    }

    RCONLog(message, options = {}) {
        return new Promise(async (res, rej) => {
            if (!message) rej(new Error("no message passed"))
            if (typeof message == 'string' && message.startsWith("Password:")) {
                this.isAuth = false;
                let password = require('crypto').createHash('md5').update(this.conf.server.password).digest('hex');
                await this._socket.write(password)
            }
            if (this.conf.extraLogging) console.log("[RCON]", message.stack ? message.stack : message)
            try {
                if (!this.conf.loggingChannel) return;
                let c = await this.channels.fetch(this.conf.loggingChannel)
                if (c) {
                    let embed = new Discord.MessageEmbed()
                        .setColor(options.color ? options.color : "GREEN")
                        .setTitle('RCON Log');
                    // this is kind of sloppy butttttt
                    embed.setDescription(`\`\`\`json\n${message}\n\`\`\``)
                    if (options.cmd) embed.addField('Command', options.cmd)
                    if (options.user && options.cmdName) embed.setFooter(`${options.cmdName} ran by ${options.user.name}`, options.user.avatar)
                    c.send({ embeds: [embed] })
                    res(false)
                }
            } catch (e) {
                res(false)
                console.log("[RCONLog] ", e.stack)
            }
        })
    }

    elevation(member) {
        if (member && member.member) member = member.member;
        if (!member || !member.permissions) return 0;
        const modRoles = { "owner": client.conf.staff.owners, "mod": { roles: client.conf.staff.moderators.roles, ids: client.conf.staff.moderators.users, permission: "BAN_MEMBERS" }, "admin": { roles: client.conf.staff.admins.roles, ids: client.conf.staff.admins.users, permission: "ADMINISTRATOR" } }
        if (member.id == member.guild.ownerId || modRoles.owner.includes(member.id)) return 3;
        const hasAdmin = (member.permissions.has(modRoles.admin.permission) == true ? true : null) || (modRoles.admin.ids.includes(member.id) ? true : null) || member.roles.cache.filter(x => modRoles.admin.roles.includes(`${x.id}`)).first()
        if (hasAdmin) return 2;
        const hasMod = (member.permissions.has(modRoles.mod.permission) == true ? true : null) || (modRoles.mod.ids.includes(member.id) ? true : null) || member.roles.cache.filter(x => modRoles.mod.roles.includes(`${x.id}`)).first()
        if (hasMod) return 1;
        return 0;
    }
}

const client = new RCON({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: ['CHANNEL', 'MESSAGE']
})

klaw("./commands").on("data", (item) => {
    const cmdFile = path.parse(item.path)
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    try {
        let props = require(`${cmdFile.dir}${path.sep}${cmdFile.name}${cmdFile.ext}`)
        console.log(`[R] Loading Command: ${props.help.name}${" ".repeat(25 - props.help.name.length)}♥`)
        client.commands.set(props.help.name, props)
        if (props.conf.aliases) props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name)
        })
    } catch (e) {
        return console.log(new Error(`FAIL: ${cmdFile.name}: ${e.stack}`))
    }
})

klaw("./events").on("data", (item) => {
    const evtFile = path.parse(item.path)
    try {
        if (!evtFile.ext || evtFile.ext !== ".js") return;
        console.log(`[R] Loading Event: ${evtFile.base}${" ".repeat(27 - evtFile.base.length)}♥`);
        const event = require(`./events/${evtFile.name}${evtFile.ext}`)
        client.on(evtFile.name, event.bind(null, client))
    } catch (e) {
        console.log(new Error(`EVENT_FAIL: ${evtFile.name}: ${e.stack}`))
    }
})

client.login(client.conf.token)