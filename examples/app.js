const config = require(`./config`)
const CiaS = require(`../index.js`);
const chalk = require('chalk');
const ciasOPTS = {
    MYSQLhost: config.mysql.host,
    MYSQLuser: config.mysql.user,
    MYSQLpassword: config.mysql.password,
    MYSQLdatabase: `Gaming_In_A_Snap`,
    EventsTable: `Events`,
    CompetitorsTable: `Competitors`,
    UsersTable: `Registration`,
    channel: `gamesinasnap`
}
const tmi = require('tmi.js');
const client = new tmi.client(config);
client.connect();
const cias = new CiaS(ciasOPTS, client);
cias.event_id = 13;
client.on('connected', async () => {
})
client.on('message', function (channel, context, msg, self) {
    const chan = channel.slice(1).toLowerCase();
    if (msg.toLowerCase().includes('cazgem')) {
        console.log(chalk.red(`-------------------------NOTICE!----------------------------`));
    } else if (msg.toLowerCase().includes('polyphony')) {
        console.log(chalk.cyan(`-------------------------NOTICE!----------------------------`));
    }
    if (self) { return; }
    let params = msg.slice(1).split(' ');
    let cname = params.shift().toLowerCase();
    let message = msg.slice(cname.length + 2);
    if (cname == 'cias') {
        let _cname = params[0];
        let message = msg.slice(cname.length + 3 + _cname.length);
        if ((params[0] == 'timer') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            console.log(`${chan}`);
            cias.timer(channel, params[1]);
        } else if (params[0] == 'time') {
            client.action(channel, `Time Remaining: ${cias.time_remaining}`);
        } else if ((params[0] == 'announce') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            cias.announce(channel, message);
        } else if ((params[0] == 'start') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            cias.starting(channel, params[1]);
        } else if ((params[0] == 'route') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            cias.route(params[1], message.slice(params[1].length + 1));
        } else if (params[0] == 'participant') {
            cias.participant(params[1], function (err, res) { client.action(channel, `${res.name}: https://twitch.tv/${res.twitch}`) });
        } else if (params[0] == 'participants') {
            cias.participants(function (err, res) {
                if (err) {
                    client.action(channel, `${err}`);
                    personality.followup(function (err, res) {
                        client.action(channel, `${res}`);
                    });

                } else {
                    if (typeof res[0] !== `undefined`) {
                        try { client.action(channel, `Participant 1 (${res[0].name}): https://twitch.tv/${res[0].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 2 (${res[1].name}): https://twitch.tv/${res[1].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 3 (${res[2].name}): https://twitch.tv/${res[2].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 4 (${res[3].name}): https://twitch.tv/${res[3].twitch}`); } catch (err) { }
                    } else {
                        try { client.action(channel, `Participant 1 (${res[1].name}): https://twitch.tv/${res[1].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 2 (${res[2].name}): https://twitch.tv/${res[2].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 3 (${res[3].name}): https://twitch.tv/${res[3].twitch}`); } catch (err) { }
                        try { client.action(channel, `Participant 4 (${res[4].name}): https://twitch.tv/${res[4].twitch}`); } catch (err) { }
                    }
                }
            });
        } else if ((params[0] == 'join') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            cias.participants(function (err, res) {
                Object.keys(res).forEach(function (id) {
                    try {
                        client.join(res[id].twitch);
                    } catch (err) {
                        console.log(chalk.red(`-----------ERROR-----------`));
                        console.log(`${err}`);
                    }
                });
            });
        } else if ((params[0] == 'part') && ((context.mod) || (context['room-id'] === context['user-id']))) {
            cias.participants(function (err, res) {
                Object.keys(res).forEach(function (id) {
                    try {
                        client.part(res[id].twitch);
                    } catch (err) {
                        console.log(chalk.red(`-----------ERROR-----------`));
                        console.log(`${err}`);
                    }
                });
            });
        } else if ((_cname == `event`) && ((context.mod) || (context['room-id'] === context['user-id']))) {
            console.log('Event Close')
            if (params[1] == 'close') {
                client.action(channel, `Event ${cias.event_id} Closed`);
                cias.event_id = null;
            } else if (params[1]) {
                cias.event_id = params[1];
                client.action(channel, `Event ${cias.event_id} Selected`);
                cias.join();
            } else {
                if (typeof cias.event_id === undefined) {
                    client.action(channel, `No Event Selected`);
                } else {
                    client.action(channel, `Event ${params[0]} Selected`);
                }
            }
        } else {
            console.log(params[1])
        }
    }
});