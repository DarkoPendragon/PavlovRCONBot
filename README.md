# PavlovRCONBot
A Discord.js bot that sends RCON commands to a Pavlov server, without any install server side. Also comes with a simple 'dashboard' website to interact with the bot. Everything here is a very simple version of the bot and dashboard, and will be heavily reworked. This is also orignially based off another repo by vankruptgames, which you can view [by clicking here](https://github.com/vankruptgames/PavlovVR-Rcon). 

# Questions or Problems
If you have an error with the code in the repo, you can open an issue and I'll look at it as soon as possible. However, if you just have a general question or problem you're welcome to join my Discord server and ping me (@darkopendragon). Invite link: https://discord.gg/EnrxfERX8T

# Install
* Download the project as a `.zip` or clone it using `git clone https://github.com/DarkoPendragon/PavlovRCONBot`
* Run `npm i` from your console in the bots working directory (main folder with `package.json` in it)
* If you haven't, create a bot application with Discord here: https://discord.com/developers/applications
* If you plan on using the dashboard, you'll need to setup a callback url to `https://<YOUR_WEBSITE>/verify/callback`
* Set `redirect_uri`, `client_id`, and `secret` in the config with the info from your Discord Application
* Configure `config.json` with your bot token and other settings
* Launch the bot by running `node index.js` or `npm start` in your console
* See `Sidenotes/Warnings` at the bottom of this page for more info

# Features
The RCON bot automatically connects to your Pavlov server and runs RCON commands sent to it (by channel or direct messages, specified in the config). You can also:
* Create custom commands (loaded from the `/commands` folder)
* Use the built in website to run commands and view online players (preview below)
![DashboardPreview](https://i.imgur.com/TDBAdlF.png)

| Option | Type | Description |  
| --- | --- | --- |
| prefix | String | Prefix to run normal commands with (e.g `d!help`) |
| token | String | Bot auth token provided by Discord |
| webPort | Intager | Port to listen to for the webserver |
| hostWeb | Boolean | Enables/disabled running the webserver/dashboard |
| server.port | String/Intiger | RCON port set in your servers RconSettings.txt |
| server.serverIP | String | Your Pavlov servers web-address |
| server.password | String | Your Pavlov servers RCON password (normal string, not md5 encypted) |
| extraLogging | Boolean | Enables a lot of useless console logging, meant for simple debugging |
| loggingChanel | String/Boolean | If set to a String, the bot will log RCON commands ran in this Discord channel (this is a channel ID) |
| runningChannel | String | Can either be a Discord channel ID or "DM," id set to DM the bot listens for commands in it's direct messages |
| allowAllUsers | Boolean | Whether to allow anyone to run RCON commands (heavily advised against when using DM's for commands) |
| allowedUsers | Array | An Array of Discord User ID's to allow when `allowAllUsers` is `false` |
| session.secret | String | Secret used for the express session |
| oauth2.redirect_uri | String | Callback URL set in your applications callback section |
| oauth2.client_id | String | ID of your Discord Application |
| oauth2.secret | String | Secret of your Discord Application |  

As of 1.1.0 you can now also give users higher access to commands without needing to give them Discord permissions in your server, under the "staff" section of the config. These are not needed though as the bot will look for the relevant permissions as well by default.
| Option | Type | Description |  
| --- | --- | --- |
| staff.owners | Array | Array of User ID's to have "full" access to commands (level 3) | 
| staff.admins.roles | Array | Array of Role ID's to allow admin acces (level 2) | 
| staff.admins.users | Array | Array of User ID's to allow admin acces (level 2) | 
| staff.moderators.roles | Array | Array of Role ID's to allow moderator acces (level 1) | 
| staff.moderators.users | Array | Array of User ID's to allow moderator acces (level 1) | 
# Config
`config.json` (default):
```json
{
    "prefix": "d!",
    "token": "token",
    "webPort": 8000,
    "hostWeb": true,
    "server": {
        "port": "serverPort",
        "serverIP": "serverIp",
        "password": "serverPassword"
    },
    "staff": {
        "owners": [],
        "moderators": {
            "roles": [],
            "users": []
        },
        "admins": {
            "roles": [],
            "users": []
        }
    },
    "extraLogging": false,
    "loggingChannel": false,
    "runningChannel": "DM",
    "allowAllUsers": true,
    "allowedUsers": [],
    "intervalSpeed": 300,
    "oauth2": {
        "redirect_uri": "http://localhost:8000/verify/callback",
        "client_id": "applicationID",
        "secret": "applicationOatuhSecret",
        "scopes": ["identify"]
    },
    "session": {
        "secret": "secret123",
        "cookie": {
            "maxAge": 86400000
        },
        "resave": true,
        "saveUninitialized": false
    }
}
```

# Custom Commands
See `/_examples/example rcon command.js`.

# Sidenotes/Warnings
## Allowing user dashboard access
To use the dashboard you **MUST** specify everyone you want to use it in `allowedUsers`. You can either add names or user ID's. An example of setting it for myself and two of my friends would look like:  
```json
{
    "allowedUsers": ["Darko Pendragon","315237909831614464","JimPlatimum"]
}
```
This will allow anyone with the usernames `Darko Pendragon` and `JimPlatimum` to use the commands, as well as a user with an ID of `315237909831614464`. Do also note that if someone changes their username you'll have to update this list with their name if you do not use their ID instead, thus using someones ID (that never changes) is suggested.

## Default Config
It is highly recommended you change `allowAllUsers` to `false` and enter your own user ID, or changing `runningChannel` to a channel ID only the bot, you and trusted users can see.  

## Limiting Commands
Custom commands can be limited to permission levels or roles, but the base commands cannot (yet). This means anyone can could run `Ban YourName` and ban you from your own Pavlov server. Of course you could just remove the ban or delete the log file for bans, but you should avoid giving access to the bot to people who aren't a moderator or trusted friend regardless.

## Flexability & Documnetation
Better and more user friendly usage of the bot along with more documentation will come with future updates.
