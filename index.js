//cias helper
const OBSWebSocket = require('obs-websocket-js');
const mysql = require(`mysql`);
module.exports = CiaS;
function CiaS(ciasOPTS, client) {
    this.event_id = '';
    this.event_start = '';
    this.event_end = '';
    this.mysql_db = mysql.createPool({
        connectionLimit: 10,
        host: ciasOPTS.MYSQLhost,
        user: ciasOPTS.MYSQLuser,
        password: ciasOPTS.MYSQLpassword,
        database: ciasOPTS.MYSQLdatabase || ciasOPTS.database
    });
    this.client = client;
    this.OBSaddress = ciasOPTS.OBSaddress;
    this.channel = ciasOPTS.channel;
    this.password = ciasOPTS.OBSpassword;
    this.eventsTable = ciasOPTS.EventsTable;
    if (typeof ciasOPTS.MYSQLtable === "undefined") { this.CompetitorsTable = ciasOPTS.CompetitorsTable } else { this.CompetitorsTable = ciasOPTS.MYSQLtable };
    if (typeof ciasOPTS.MYSQLtable_2 === "undefined") { this.UsersTable = ciasOPTS.UsersTable } else { this.UsersTable = ciasOPTS.MYSQLtable_2 };
    this.competitors_sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
}
CiaS.prototype.announce = function (msg, context) {
    const that = this;
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`Announcing: ${msg.slice(9)}`);
        Object.keys(result).forEach(function (id) {
            that.client.action(result[id].twitch, msg.slice(9));
        });
    });
}
CiaS.prototype.announce_all = function (msg, context) {
    const that = this;
    this.client.action(this.channel, msg.slice(9));
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`Announcing: ${msg.slice(9)}`);
        Object.keys(result).forEach(function (id) {
            that.client.action(result[id].twitch, msg.slice(9));
        });
    });
}
CiaS.prototype.route = function (participant, msg, context) {
    const that = this;
    let sql = `SELECT name FROM CiaS_Participants WHERE number=${participant}`;
    console.log(sql);
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            that.client.action(result[id].twitch, msg);
        });
    });
    this.mysql_db.end();
}
CiaS.prototype.OBS_RefreshParticipants = async function (participant) {
    let source = `Participant ${participant} Screen`;
    let source2 = `Participant Name ${participant}`;
    let source3 = `NamePlate ${participant}`;
    let source4 = `Participant ${participant} Picture`;
    const that = this;
    const obs = new OBSWebSocket();
    console.log(`${this.OBSaddress} ${this.OBSpassword}`)
    obs.connect({
        address: this.OBSaddress,
        password: this.OBSpassword
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
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source4,
                visible: false
            })
            setTimeout(() => {
                obs.send('SetSceneItemProperties', {
                    item: source4,
                    visible: true
                })
            }, 2000);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.clear = function () {
    let source = `Participant 1 Picture`;
    let source2 = `Participant 2 Picture`;
    let source3 = `Participant 3 Picture`;
    let source4 = `Participant 4 Picture`;
    const that = this;
    const obs = new OBSWebSocket();
    obs.connect({
        address: this.OBSaddress,
        password: this.OBSpassword
    })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source,
                visible: false
            })
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source2,
                visible: false
            })
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source3,
                visible: false
            })
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: source4,
                visible: false
            })
        })
        .then(data => {
            obs.send('SetSceneItemProperties', {
                item: `Voting`,
                visible: false
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.addParticipant = function (number, name, channel) {
    let sql = `UPDATE CiaS_Participants SET name = "${name}", WHERE number = "${number}"`;
    let query = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
    });
    console.log('Participant Added');
    console.log('Participant URL Identified');
    this.updateURL(number, name);
    console.log("Preparing to Refresh nameplates");
    this.OBS_RefreshParticipants(number);
    this.client.action(channel, 'Edited Participant ' + number + ' information.');
    this.client.action(name, `Hey there, ${name}! I've been sent by CiaS staff to help things run smoothly for you during this event. In order to ensure I can do my job, I need to be granted moderator privileges for the duration of the event. Thanks, and good luck!`);
    console.log(channel + ': Edited Participant ' + number + ' information.');
    this.mysql_db.end();
}
CiaS.prototype.refreshParticipantNames = function (participant) {
    let source = `Participant Name ${participant}`;
    const that = this;
    const obs = new OBSWebSocket();
    obs.connect({
        address: that.OBSaddress,
        password: that.OBSpassword
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
CiaS.prototype.updateURL = function (number, name) {
    let num = number;
    let nam = name;
    console.log(`OBS Prepping for updateURL`);
    const that = this;
    const obs = new OBSWebSocket();
    obs.connect({
        address: that.OBSaddress,
        password: that.OBSpassword
    })
        .then(() => {
            console.log(`OBS Connection Established for updateURL`);
        })
        .then(() => {
            return obs.send('SetBrowserSourceProperties', {
                source: `Participant ${num} Screen`,
                url: `https://player.twitch.tv/?channel=${nam}&parent=streamernews.example.com&muted=true`
            })
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.join = function () {
    const that = this;
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            that.client.join(result[id].twitch);
        });
    });
}
CiaS.prototype.part = function () {
    const that = this;
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            that.client.part(result[id].twitch);
        });
    });
}
CiaS.prototype.participants = function (channel) {
    const that = this;
    this.client.action(channel, "This round's Participants are: ");
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) console.log(err);
        const that = this;
        Object.keys(result).forEach(function (id) {
            that.client.action(channel, result[id].name + ": https://twitch.tv/" + result[id].twitch);
        });
    });
    // this.mysql_db.end();
}
CiaS.prototype.tenseconds = function () {
    const that = this;
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds remain! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ");
            setTimeout(() => {
                that.client.action(result[id].twitch, "9 seconds");
            }, 1000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "8");
            }, 2000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "7");
            }, 3000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "6");
            }, 4000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "5");
            }, 5000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "4");
            }, 6000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "3");
            }, 7000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "2");
            }, 8000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "1");
            }, 9000);
            setTimeout(() => {
                that.client.action(result[id].twitch, "cities1Stop cities1Stop cities1Stop All building Must stop! cities1Stop cities1Stop cities1Stop ");
            }, 10000);
        });
    });
}
CiaS.prototype.starting = function () {
    const that = this;
    let sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    let response = this.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        Object.keys(result).forEach(function (id) {
            try {
                that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 30 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

            } catch (err) {

            }
            setTimeout(() => {
                try {
                    that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 20 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 10000);
            setTimeout(() => {
                try {
                    that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 20000);
            setTimeout(() => {
                try {
                    that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 5 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 25000);
            setTimeout(() => {
                try {
                    that.client.action(result[id].twitch, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 Begin! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");

                } catch (err) {

                }
            }, 30000);
        });
    });
}
CiaS.prototype.refreshParticipants = function (params) {
    if (params[0] === `all`) {
        this.OBS_RefreshParticipants(1);
        this.OBS_RefreshParticipants(2);
        this.OBS_RefreshParticipants(3);
        this.OBS_RefreshParticipants(4);
    } else {
        this.OBS_RefreshParticipants(params[0]);
    }

}
CiaS.prototype.winner = function (participant, callback) {
    let source = `Participant ${participant} Picture`;
    let sceneName = `Focus ${participant}`;
    const that = this;
    const obs = new OBSWebSocket();
    obs.connect({
        address: that.OBSaddress,
        password: that.OBSpassword
    })
        .then(() => {
            console.log(`OBS Connection Established`);
        })
        .then(() => {
            obs.send('SetSceneItemProperties', {
                item: `ParticipantPhotos`,
                visible: true
            })
        })
        .then(() => {
            obs.send('SetSceneItemProperties', {
                item: source,
                visible: true
            })
            setTimeout(() => {
                console.log(`Found a different scene! Switching to Scene: ${sceneName}`);
                obs.send('SetCurrentScene', {
                    'scene-name': sceneName
                });
            }, 10000);
        })
        .then(() => {
            return callback(null, participant);
        })
        .catch(err => { // Promise convention dicates you have a catch on every chain.
            console.log(err);
        });
}
CiaS.prototype.guest = function (msg, callback) {

}