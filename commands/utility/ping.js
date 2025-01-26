exports.run = async (client, message, args) => {
  const msgPong = await message.channel.send("Poking the Discord Samurai's...");
  const timeDiff = msgPong.createdTimestamp - message.createdTimestamp;
  msgPong.edit(`:ping_pong:: ${timeDiff}ms\n:heart_decoration:: ${Math.round(client.ping)}ms`);
};

exports.conf = {
  enabled: true,
  serverOnly: false,
  allowedServers: [],
  aliases: ['response'],
  permLevel: 0
};

exports.help = {
  type: 'utility',
  name: 'ping',
  requireLog: false,
  description: 'Basic response command.',
  usage: 'ping'
};
