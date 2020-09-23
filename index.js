//cias helper
const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
const mysql = require(`mysql`);
const polyphony = require('polyphony.js');
module.exports = CiaS;
function CiaS() {

}
CiaS.prototype.announce = function (client, msg, context, channel, ciasOPTS) {
    if (context.mod || (context["user-id"] === context["room-id"])) {
        const db = mysql.createConnection({
            host: ciasOPTS.MYSQLhost,
            user: ciasOPTS.MYSQLuser,
            password: ciasOPTS.MYSQLpassword,
            database: ciasOPTS.MYSQLdatabase
        });
        let sql = `SELECT name FROM ${ciasOPTS.MYSQLtable}`;
        let response = db.query(sql, (err, result) => {
            if (err) throw err;
            console.log(err);
            console.log(msg.slice(9));
            Object.keys(result).forEach(function (id) {
                client.action(result[id].name, msg.slice(9));
                console.log(msg.slice(9));
            });
        });
        db.end();
    }
}
CiaS.prototype.OBS_RefreshParticipants = async function (participant, ciasOPTS) {
    const obs = new OBSWebSocket();
    let source = `Participant ${participant} Screen`;
    let source2 = `Participant Name ${participant}`;
    let source3 = `NamePlate ${participant}`;
    obs.connect({
        address: ciasOPTS.OBSaddress,
        password: ciasOPTS.OBSpassword
    })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source,
                visible: false
            })
            setTimeout(() => {
                obs.send('SetSceneItemProperties', {
                    item: source,
                    visible: true
                })
            }, 2000);
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source2,
                visible: false
            })
            setTimeout(() => {
                obs.send('SetSceneItemProperties', {
                    item: source2,
                    visible: true
                })
            }, 2000);
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source3,
                visible: false
            })
            setTimeout(() => {
                obs.send('SetSceneItemProperties', {
                    item: source3,
                    visible: true
                })
            }, 2000);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.addParticipant = function (number, name, channel, client, ciasOPTS) {
    const db = mysql.createConnection({
        host: ciasOPTS.MYSQLhost,
        user: ciasOPTS.MYSQLuser,
        password: ciasOPTS.MYSQLpassword,
        database: ciasOPTS.MYSQLdatabase
    });
    let sql = `UPDATE ${ciasOPTS.MYSQLtable} SET name = "${name}" WHERE number = "${number}"`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
    });
    console.log('Participant Added');
    console.log('Participant URL Identified');
    this.updateURL(number, name, ciasOPTS);
    console.log("Preparing to Refresh nameplates");
    this.OBS_RefreshParticipants(number, ciasOPTS);
    client.action(channel, 'Edited Participant ' + number + ' information.');
    client.action(name, `Hey there, ${name}! I've been sent by CiaS staff to help things run smoothly for you during this event. In order to ensure I can do my job, I need to be granted moderator privileges for the duration of the event. Thanks, and good luck!`);
    console.log(channel, 'Edited Participant ' + number + ' information.');
    db.end();
}
CiaS.prototype.refreshParticipantNames = function (participant, ciasOPTS) {
    let source = `Participant Name ${participant}`;
    obs.connect({
        address: ciasOPTS.OBSaddress,
        password: ciasOPTS.OBSpassword
    })
        .then(() => {
            console.log(`OBS Connection Established`);
        })
        .then(() => {
            obs.send('SetSceneItemProperties', {
                item: source,
                visible: false
            })
            setTimeout(() => {
                obs.send('SetSceneItemProperties', {
                    item: source,
                    visible: true
                })
            }, 1000);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.updateURL = function (number, name, ciasOPTS) {
    console.log(`OBS Prepping for updateURL`);
    const obs = new OBSWebSocket();
    obs.connect({
        address: `${ciasOPTS.OBSaddress}`,
        password: `${ciasOPTS.OBSpassword}`
    })
        .then(() => {
            console.log(`OBS Connection Established for updateURL`);
        })
        .then(() => {
            return obs.send('SetBrowserSourceProperties', {
                source: `Participant ${number} Screen`,
                url: `https://player.twitch.tv/?channel=${name}&parent=streamernews.example.com&muted=true`
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.participants = function (client, params, context, channel, ciasOPTS) {
    const db = mysql.createConnection({
        host: ciasOPTS.MYSQLhost,
        user: ciasOPTS.MYSQLuser,
        password: ciasOPTS.MYSQLpassword,
        database: ciasOPTS.MYSQLdatabase
    });
    if ((params[0] === 'edit') && ((context['user-type'] === ('mod')) || (context["display-name"] === "citiesinasnap"))) {
        this.addParticipant(params[1], params[2], channel, client, ciasOPTS);
    } else if ((params[0] === 'new') && ((context['user-type'] === ('mod')) || (context["display-name"] === "citiesinasnap"))) {
        this.addParticipant(1, params[1], channel, client, ciasOPTS)
        setTimeout(() => {
            this.addParticipant(2, params[2], channel, client, ciasOPTS);
        }, 1000);
        setTimeout(() => {
            this.addParticipant(3, params[3], channel, client, ciasOPTS);
        }, 2000);
        setTimeout(() => {
            this.addParticipant(4, params[4], channel, client, ciasOPTS);
        }, 3000);
    } else if ((params[0] === 'join') && ((context['user-type'] === ('mod')) || (context["display-name"] === "citiesinasnap"))) {
        client.action(channel, "This round's Participants are: ");
        let sql = `SELECT * FROM ${ciasOPTS.MYSQLtable}`;
        let response = db.query(sql, (err, result) => {
            if (err) throw err;
            Object.keys(result).forEach(function (id) {
                client.join(result[id].name);
            });
        });
    } else if ((params[0] === 'part') && ((context['user-type'] === ('mod')) || (context["display-name"] === "citiesinasnap"))) {
        client.action(channel, "This round's Participants are: ");
        let sql = `SELECT * FROM ${ciasOPTS.MYSQLtable}`;
        let response = db.query(sql, (err, result) => {
            if (err) throw err;
            Object.keys(result).forEach(function (id) {
                client.part(result[id].name);
            });
        });
    } else {
        console.log(ciasOPTS.MYSQLtable);
        client.action(channel, "This round's Participants are: ");
        let sql = `SELECT * FROM ${ciasOPTS.MYSQLtable}`;
        let response = db.query(sql, (err, result) => {
            if (err) throw err;
            Object.keys(result).forEach(function (id) {
                client.action(channel, "Participant no. " + result[id].number + ": https://twitch.tv/" + result[id].name);
            });
        });
    }
    db.end();
}
CiaS.prototype.tenseconds = function (client, ciasOPTS) {
    const db = mysql.createConnection({
        host: ciasOPTS.MYSQLhost,
        user: ciasOPTS.MYSQLuser,
        password: ciasOPTS.MYSQLpassword,
        database: ciasOPTS.MYSQLdatabase
    });
    let sql = `SELECT name FROM ${ciasOPTS.MYSQLtable}`;
    let response = db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds remain! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ");
            client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds remain! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ");
            setTimeout(() => {
                client.action(result[id].name, "9 seconds");
            }, 1000);
            setTimeout(() => {
                client.action(result[id].name, "8");
            }, 2000);
            setTimeout(() => {
                client.action(result[id].name, "7");
            }, 3000);
            setTimeout(() => {
                client.action(result[id].name, "6");
            }, 4000);
            setTimeout(() => {
                client.action(result[id].name, "5");
            }, 5000);
            setTimeout(() => {
                client.action(result[id].name, "4");
            }, 6000);
            setTimeout(() => {
                client.action(result[id].name, "3");
            }, 7000);
            setTimeout(() => {
                client.action(result[id].name, "2");
            }, 8000);
            setTimeout(() => {
                client.action(result[id].name, "1");
            }, 9000);
            setTimeout(() => {
                client.action(result[id].name, "cities1Stop cities1Stop cities1Stop All building Must stop! cities1Stop cities1Stop cities1Stop ");
            }, 10000);
        });
    });
    db.end();
}
CiaS.prototype.starting = function (client, ciasOPTS) {
    const db = mysql.createConnection({
        host: ciasOPTS.MYSQLhost,
        user: ciasOPTS.MYSQLuser,
        password: ciasOPTS.MYSQLpassword,
        database: ciasOPTS.MYSQLdatabase
    });
    let sql = `SELECT name FROM ${ciasOPTS.MYSQLtable}`;
    let response = db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            try {
                client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 30 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

            } catch (err) {

            }
            setTimeout(() => {
                try {
                    client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 20 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 10000);
            setTimeout(() => {
                try {
                    client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 20000);
            setTimeout(() => {
                try {
                    client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 5 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 25000);
            setTimeout(() => {
                try {
                    client.action(result[id].name, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 Begin! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 30000);
        });
    });
    db.end();
}
CiaS.prototype.refreshParticipants = function (params, ciasOPTS) {
    if (params[0] === `all`) {
        this.OBS_RefreshParticipants(1, ciasOPTS);
        this.OBS_RefreshParticipants(2, ciasOPTS);
        this.OBS_RefreshParticipants(3, ciasOPTS);
        this.OBS_RefreshParticipants(4, ciasOPTS);
    } else {
        this.OBS_RefreshParticipants(params[0], ciasOPTS);
    }

}