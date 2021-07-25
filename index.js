//cias helper
const mysql = require(`mysql`);
const path = require('path');
const chalk = require('chalk');
const NodeCache = require("node-cache");
const participants = new NodeCache();
module.exports = CiaS;
function CiaS(ciasOPTS, client) {
    console.log(chalk.blue(`CiaS Module Ready!`));
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
    this.mongopath = ciasOPTS.mongopath;
    this.password = ciasOPTS.OBSpassword;
    this.eventsTable = ciasOPTS.EventsTable;
    if (typeof ciasOPTS.MYSQLtable === "undefined") { this.CompetitorsTable = ciasOPTS.CompetitorsTable } else { this.CompetitorsTable = ciasOPTS.MYSQLtable };
    if (typeof ciasOPTS.MYSQLtable_2 === "undefined") { this.UsersTable = ciasOPTS.UsersTable } else { this.UsersTable = ciasOPTS.MYSQLtable_2 };
    this.competitors_sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
}
CiaS.prototype.createDB = function () {
    MongoClient.connect(this.mongopath, function (err, db) {
        if (err) throw err;
        console.log("Database created!");
        db.close();
    });
}
CiaS.prototype.announce = function (channel, msg) {
    const that = this;
    this.fetchall(function (err, res) {
        console.log(chalk.yellow(`Announcement: ${msg}`));
        if (channel !== null) {
            that.client.action(channel, msg);
        }
        Object.keys(res).forEach(function (id) {
            that.client.action(res[id].twitch, msg);
        });
    });
}
CiaS.prototype.timer = async function (channel, i) {
    const that = this;
    console.log(`${i} minutes remaining`);
    i = i * 60;
    var myVar = setInterval(function () {
        i--;
        console.log(`${i} seconds remaining`);
        if (i == 10) {
            that.tenseconds(channel);
            clearInterval(myVar);
        }
    }, 1000);
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
CiaS.prototype.fetch = function (participant, callback) {
    const that = this;
    console.log(chalk.blue(`Fetching Participant ${participant}... `));
    let value = participants.get(`${participant}`);
    if (value == undefined) {
        console.log(chalk.red(`No Participants Found. Fetching from remote db.....`));
        let sql = `SELECT * FROM ` + that.CompetitorsTable + ` INNER JOIN ` + that.UsersTable + ` ON ` + that.CompetitorsTable + `.entrant = ` + that.UsersTable + `.id WHERE ` + that.CompetitorsTable + `.event = ` + that.event_id + ` ORDER BY ` + that.CompetitorsTable + `.id ASC`;
        let response = that.mysql_db.query(sql, (err, result) => {
            if (err) throw err;
            Object.keys(result).forEach(function (id, i) {
                let count = i + 1;
                obj = { id: `${result[id].id}`, name: `${result[id].name}`, twitch: `${result[id].twitch}` };
                success = participants.set(`${i + 1}`, obj, (24 * 3600));
                if (participant == count) {
                    console.log(chalk.green(`Remote Participant Found!`));
                    return callback(null, result[id]);
                }
            });
        });
    } else {
        console.log(chalk.green(`Local Participant Found!`));
        return callback(null, value);
    }
}
CiaS.prototype.fetchall = function (callback) {
    const that = this;
    console.log(chalk.blue(`Fetching Participants... `));
    let value = participants.get(`1`);
    if (value == undefined) {
        console.log(chalk.red(`No Participants Found. Fetching from remote db.....`));
        let sql = `SELECT * FROM ` + that.CompetitorsTable + ` INNER JOIN ` + that.UsersTable + ` ON ` + that.CompetitorsTable + `.entrant = ` + that.UsersTable + `.id WHERE ` + that.CompetitorsTable + `.event = ` + that.event_id + ` ORDER BY ` + that.CompetitorsTable + `.id ASC`;
        let response = that.mysql_db.query(sql, (err, result) => {
            if (err) throw err;
            console.log(chalk.green(`Remote Participants Found!`));
            Object.keys(result).forEach(function (id, i) {
                let count = i + 1;
                obj = { id: `${result[id].id}`, name: `${result[id].name}`, twitch: `${result[id].twitch}` };
                success = participants.set(`${i + 1}`, obj, (24 * 3600));
            });
            return callback(null, result);
        });
    } else {
        console.log(chalk.green(`Local Participants Found!`));
        value = participants.mget(["1", "2", "3", "4"]);
        return callback(null, value);
    }
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
CiaS.prototype.participant = function (participant, callback) {
    const that = this;
    this.fetch(participant, function (err, res) {
        return callback(null, res);
    });
}
CiaS.prototype.participants = function (callback) {
    const that = this;
    this.fetchall(function (err, res) {
        return callback(null, res);
    });
}
CiaS.prototype.tenseconds = function (channel) {
    const that = this;
    that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds remain! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ");
    setTimeout(() => {
        that.announce(channel, "9 seconds");
    }, 1000);
    setTimeout(() => {
        that.announce(channel, "8");
    }, 2000);
    setTimeout(() => {
        that.announce(channel, "7");
    }, 3000);
    setTimeout(() => {
        that.announce(channel, "6");
    }, 4000);
    setTimeout(() => {
        that.announce(channel, "5");
    }, 5000);
    setTimeout(() => {
        that.announce(channel, "4");
    }, 6000);
    setTimeout(() => {
        that.announce(channel, "3");
    }, 7000);
    setTimeout(() => {
        that.announce(channel, "2");
    }, 8000);
    setTimeout(() => {
        that.announce(channel, "1");
    }, 9000);
    setTimeout(() => {
        that.announce(channel, "cities1Stop cities1Stop cities1Stop All building Must stop! cities1Stop cities1Stop cities1Stop ");
    }, 10000);
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