exports.run = function(client, message, args) {
  const option = args.slice(0, 1);
  const muser = message.mentions.users.first();

  if (message.mentions.users.size < 1) {
    message.reply(`here is your avatar!\n${message.author.displayAvatarURL({format: "png", dynamic: true})}`).catch(console.error);
  } else {
    if (muser.id === message.author.id) return message.reply(`here is your avatar!\n${message.author.displayAvatarURL({format: "png", dynamic: true})}`).catch(console.error);
    message.reply(`here is ${muser}'s avatar!\n${muser.displayAvatarURL({format: "png", dynamic: true})}`).catch(console.error);
  };
};
exports.conf = {
  enabled: true,
  serverOnly: false,
  allowedServers: [],
  aliases: ['ava', 'avatar'],
  permLevel: 0
};

exports.help = {
  type: 'utility',
  name: 'avi',
  requireLog: false,
  description: 'Returns with your avatar image or the users mentioned.',
  usage: 'avi [@user]'
};
