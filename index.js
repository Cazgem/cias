//cias helper
const mysql = require(`mysql`);
const path = require('path');
const chalk = require('chalk');
const NodeCache = require("node-cache");
const participants = new NodeCache();
module.exports = CiaS;
function CiaS(ciasOPTS, client) {
    console.log(chalk.blue(`CiaS Module Ready!`));
    this.event_id = null;
    this.event_start = '';
    this.event_end = '';
    this.time_remaining = null;
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
CiaS.prototype.announce = function (channel, msg) {
    const that = this;
    try {
        this.fetchall(function (err, res) {
            console.log(chalk.yellow(`Announcement: ${msg}`));
            if (channel !== null) {
                that.client.action(channel, msg);
            }
            Object.keys(res).forEach(function (id) {
                that.client.action(res[id].twitch, msg);
            });
        });
    } catch (err) {

    }
}
CiaS.prototype.timer = async function (channel, i) {
    const that = this;
    console.log(`${i} minutes remaining`);
    i = i * 60;
    var myVar = setInterval(function () {
        i--;
        if (i == (105 * 60)) {
            that.timeRemaining(`1 Hour, 45 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (90 * 60)) {
            that.timeRemaining(`1 Hour, 30 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (75 * 60)) {
            that.timeRemaining(`1 Hour, 15 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (60 * 60)) {
            that.timeRemaining(`60 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (45 * 60)) {
            that.timeRemaining(`45 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (30 * 60)) {
            that.timeRemaining(`30 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (15 * 60)) {
            that.timeRemaining(`15 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (10 * 60)) {
            that.timeRemaining(`10 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (5 * 60)) {
            that.timeRemaining(`5 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (3 * 60)) {
            that.timeRemaining(`3 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (2 * 60)) {
            that.timeRemaining(`2 minutes remain!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (1.5 * 60)) {
            that.timeRemaining(`90 seconds left!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (1 * 60)) {
            that.timeRemaining(`60 seconds!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (45)) {
            that.timeRemaining(`45 seconds left!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (30)) {
            that.timeRemaining(`30 seconds left!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == (15)) {
            that.timeRemaining(`15 seconds!`, function (err, res) {
                that.announce(channel, res);
            });
        } else if (i == 10) {
            that.tenseconds(channel);
            clearInterval(myVar);
        }
    }, 1000);
}
CiaS.prototype.timeRemaining = function (timeleft, callback) {
    const that = this;
    let res = `cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ${timeleft} cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1`;
    return callback(null, res);
}
CiaS.prototype.route = function (participant, msg) {
    const that = this;
    this.fetch(participant, function (err, res) {
        console.log(chalk.yellow(`Routing to Participant ${participant}: ${msg}`));
        that.client.action(res.twitch, msg);
    });
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
    this.fetchall(function (err, res) {
        Object.keys(res).forEach(function (id) {
            try {
                that.client.join(res[id].twitch);
            } catch (err) {

            }
        });
    });
}
CiaS.prototype.part = function () {
    const that = this;
    this.fetchall(function (err, res) {
        Object.keys(res).forEach(function (id) {
            try {
                that.client.part(res[id].twitch);
            } catch (err) {
                console.log(chalk.red(`-----------ERROR-----------`));
                console.log(`${err}`);
            }
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
    if (this.event_id == null) {
        return callback(`No Event Selected!`, null);
    } else {
        this.fetchall(function (err, res) {
            return callback(null, res);
        });
    }
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
CiaS.prototype.starting = function (channel, length) {
    const that = this;
    that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 30 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 20 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    }, 10000);
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    }, 20000);
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 5 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    }, 25000);
    setTimeout(() => {
        that.announce(channel, "4 seconds Until Start!");
    }, 26000);
    setTimeout(() => {
        that.announce(channel, "3 seconds Until Start!");
    }, 27000);
    setTimeout(() => {
        that.announce(channel, "2 seconds Until Start!");
    }, 28000);
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 1 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    }, 29000);
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 Begin! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
        if (length !== null) {
            that.timer(channel, length);
        } else {
            that.timer(channel, 120);
        }
    }, 30000);
}