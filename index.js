//cias helper
/**
 * @param {number} length Length of Competition, in Minutes
 * @param {string} channel Channel variable provided by tmi.js channel parameter.
 * @param {integer} participant Participant number as non-zero integer
 * @param {string} msg String to be conveyed as a message.
 * @param {string} config Configuration Settings as object.
 * @param {string} client Client object as defined by tmi.js.
 * @param {function} callback Callback Function: function (err, res) {
 * Do Stuff Here}.
 */
const mysql = require(`mysql`);
const chalk = require('chalk');
const NodeCache = require("node-cache");
const participants = new NodeCache();
module.exports = CiaS;
function CiaS(config, client) {
    this.event_id = null;
    this.event_start = '';
    this.event_end = '';
    this.time_remaining = null;
    this.mysql = mysql;
    this.mysql_host = config.MYSQLhost;
    this.mysql_user = config.MYSQLuser;
    this.mysql_password = config.MYSQLpassword;
    this.mysql_database = config.MYSQLdatabase || config.database;
    if (config.initialize) {
        this.initialize();
    } else {
        console.log(chalk.yellow(`CiaS: Database Setup Skipped`))
    }
    this.mysql_db = mysql.createPool({
        connectionLimit: 10,
        host: this.mysql_host,
        user: this.mysql_user,
        password: this.mysql_password,
        database: this.mysql_database
    });
    this.client = client;
    this.channel = config.channel;
    this.eventsTable = config.EventsTable;
    if (typeof config.MYSQLtable === "undefined") { this.CompetitorsTable = config.CompetitorsTable } else { this.CompetitorsTable = config.MYSQLtable };
    if (typeof config.MYSQLtable_2 === "undefined") { this.UsersTable = config.UsersTable } else { this.UsersTable = config.MYSQLtable_2 };
    this.competitors_sql = `SELECT * FROM ` + this.CompetitorsTable + ` INNER JOIN ` + this.UsersTable + ` ON ` + this.CompetitorsTable + `.entrant = ` + this.UsersTable + `.id WHERE ` + this.CompetitorsTable + `.event = ` + this.event_id + ` ORDER BY ` + this.CompetitorsTable + `.id ASC`;
    console.log(chalk.blue(`CiaS: Ready!`));
}
CiaS.prototype.announce = function (channel, msg) {
    const that = this;
    try {
        this.fetchall(function (err, res) {
            console.log(chalk.yellow(`CiaS: <Announcement> ${msg}`));
            if (channel !== null) {
                that.client.action(channel, msg);
            }
            Object.keys(res).forEach(function (id) {
                that.client.action(res[id].twitch, msg);
            });
        });
    } catch (err) {
        this.error(err);
    }
}
CiaS.prototype.route = function (participant, msg) {
    const that = this;
    try {
        this.fetch(participant, function (err, res) {
            console.log(chalk.yellow(`CiaS: Routing to Participant ${participant}: ${msg}`));
            that.client.action(res.twitch, msg);
        });
    } catch (err) {
        this.error(err);
    }
}
CiaS.prototype.join = function (callback = null) {
    const that = this;
    try {
        this.fetchall(function (err, res) {
            console.log(chalk.yellow(`CiaS: Join`));
            Object.keys(res).forEach(function (id) {
                that.client.join(res[id].twitch);
            });
            if (callback) {
                callback(err, res);
            }
        });
    } catch (err) {
        this.error(err);
    }
}
CiaS.prototype.part = function (callback = null) {
    const that = this;
    try {
        this.fetchall(function (err, res) {
            console.log(chalk.yellow(`CiaS: Part`));
            Object.keys(res).forEach(function (id) {
                that.client.part(res[id].twitch);
            });
            if (callback) {
                callback(err, res);
            }
        });
    } catch (err) {
        this.error(err);
    }
}
CiaS.prototype.timeRemaining = function (timeleft, callback) {
    const that = this;
    let res = `cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ${timeleft} cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1`;
    return callback(null, res);
}
CiaS.prototype.participant = function (participant, callback) {
    const that = this;
    if (this.event_id == null) {
        return callback(`No Event Selected!`, null);
    } else {
        this.fetch(participant, function (err, res) {
            return callback(null, res);
        });
    }
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
CiaS.prototype.error = function (err) {
    console.log(chalk.red(`-------- CiaS ERROR -------`));
    console.log(`${err}`);
    console.log(chalk.red(`---------------------------`));
}
CiaS.prototype.fetch = function (participant, callback) {
    const that = this;
    console.log(chalk.blue(`CiaS: Fetching Participant ${participant}... `));
    let value = participants.get(`${participant}`);
    if (value == undefined) {
        console.log(chalk.red(`CiaS: No Participants Found. Fetching from remote db.....`));
        let sql = `SELECT * FROM ` + that.CompetitorsTable + ` INNER JOIN ` + that.UsersTable + ` ON ` + that.CompetitorsTable + `.entrant = ` + that.UsersTable + `.id WHERE ` + that.CompetitorsTable + `.event = ` + that.event_id + ` ORDER BY ` + that.CompetitorsTable + `.id ASC`;
        let response = that.mysql_db.query(sql, (err, result) => {
            if (err) throw err;
            Object.keys(result).forEach(function (id, i) {
                let count = i + 1;
                obj = { id: `${result[id].id}`, name: `${result[id].name}`, twitch: `${result[id].twitch}` };
                success = participants.set(`${i + 1}`, obj, (24 * 3600));
                if (participant == count) {
                    console.log(chalk.green(`CiaS: Remote Participant Found!`));
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
            console.log(chalk.green(`CiaS: Remote Participants Found!`));
            Object.keys(result).forEach(function (id, i) {
                let count = i + 1;
                obj = { id: `${result[id].id}`, name: `${result[id].name}`, twitch: `${result[id].twitch}` };
                success = participants.set(`${i + 1}`, obj, (24 * 3600));
            });
            return callback(null, result);
        });
    } else {
        console.log(chalk.green(`CiaS: Local Participants Found!`));
        value = participants.mget(["1", "2", "3", "4"]);
        return callback(null, value);
    }
}
CiaS.prototype.refresh = function (callback) {
    const that = this;
    console.log(chalk.blue(`Refreshing Participants... `));
    participants.flushAll();
    let sql = `SELECT * FROM ` + that.CompetitorsTable + ` INNER JOIN ` + that.UsersTable + ` ON ` + that.CompetitorsTable + `.entrant = ` + that.UsersTable + `.id WHERE ` + that.CompetitorsTable + `.event = ` + that.event_id + ` ORDER BY ` + that.CompetitorsTable + `.id ASC`;
    let response = that.mysql_db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(chalk.green(`CiaS: Remote Participants Found!`));
        Object.keys(result).forEach(function (id, i) {
            let count = i + 1;
            obj = { id: `${result[id].id}`, name: `${result[id].name}`, twitch: `${result[id].twitch}` };
            success = participants.set(`${i + 1}`, obj, (24 * 3600));
        });
        console.log(chalk.cyan(`CiaS: Participants Updated`));
        callback(null, true);
    });
}
CiaS.prototype.timer = async function (channel, length) {
    const that = this;
    console.log(`${length} minutes remaining`);
    i = length * 60;
    var myVar = setInterval(function () {
        i--;
        if (i == (105 * 60)) {
            that.timeRemaining(`1 Hour, 45 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (90 * 60)) {
            that.timeRemaining(`1 Hour, 30 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (75 * 60)) {
            that.timeRemaining(`1 Hour, 15 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (60 * 60)) {
            that.timeRemaining(`60 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (45 * 60)) {
            that.timeRemaining(`45 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (30 * 60)) {
            that.timeRemaining(`30 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (15 * 60)) {
            that.timeRemaining(`15 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (10 * 60)) {
            that.timeRemaining(`10 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (5 * 60)) {
            that.timeRemaining(`5 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (3 * 60)) {
            that.timeRemaining(`3 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (2 * 60)) {
            that.timeRemaining(`2 minutes remain!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (1.5 * 60)) {
            that.timeRemaining(`90 seconds left!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (1 * 60)) {
            that.timeRemaining(`60 seconds!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (45)) {
            that.timeRemaining(`45 seconds left!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (30)) {
            that.timeRemaining(`30 seconds left!`, function (err, res) { that.announce(channel, res); });
        } else if (i == (15)) {
            that.timeRemaining(`15 seconds!`, function (err, res) { that.announce(channel, res); });
        } else if (i == 10) { that.tenseconds(channel); clearInterval(myVar); }
    }, 1000);
}
CiaS.prototype.tenseconds = function (channel) {
    const that = this;
    that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds remain! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 ");
    setTimeout(() => { that.announce(channel, "9 seconds"); }, 1000);
    setTimeout(() => { that.announce(channel, "8"); }, 2000);
    setTimeout(() => { that.announce(channel, "7"); }, 3000);
    setTimeout(() => { that.announce(channel, "6"); }, 4000);
    setTimeout(() => { that.announce(channel, "5"); }, 5000);
    setTimeout(() => { that.announce(channel, "4"); }, 6000);
    setTimeout(() => { that.announce(channel, "3"); }, 7000);
    setTimeout(() => { that.announce(channel, "2"); }, 8000);
    setTimeout(() => { that.announce(channel, "1"); }, 9000);
    setTimeout(() => { that.announce(channel, "cities1Stop cities1Stop cities1Stop All building Must stop! cities1Stop cities1Stop cities1Stop "); }, 10000);
}
CiaS.prototype.starting = function (channel, length) {
    const that = this;
    that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 30 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
    setTimeout(() => { that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 20 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1"); }, 10000);
    setTimeout(() => { that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 10 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1"); }, 20000);
    setTimeout(() => { that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 5 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1"); }, 25000);
    setTimeout(() => { that.announce(channel, "4 seconds Until Start!"); }, 26000);
    setTimeout(() => { that.announce(channel, "3 seconds Until Start!"); }, 27000);
    setTimeout(() => { that.announce(channel, "2 seconds Until Start!"); }, 28000);
    setTimeout(() => { that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 1 seconds Until Start! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1"); }, 29000);
    setTimeout(() => {
        that.announce(channel, "cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1 Begin! cities1Stopwatch1 cities1Stopwatch1 cities1Stopwatch1");
        if (length == 0) {

        } else if (length !== null) {
            that.timer(channel, length);
        } else {
            that.timer(channel, 120);
        }
    }, 30000);
}
CiaS.prototype.initialize = async function () {
    const that = this;
    var con = that.mysql.createConnection({
        host: that.mysql_host,
        user: that.mysql_user,
        password: that.mysql_password
    });

    con.connect(function (err) {
        if (err) throw err;
        con.query(`CREATE DATABASE IF NOT EXISTS ${that.mysql_database}`, function (err, result) {
            if (err) throw err;
            that.createTables();
            console.log(chalk.cyan(`CiaS: Database is Ready!`));
        });
    });

}
CiaS.prototype.createTables = function () {
    var con = this.mysql.createConnection({
        host: this.mysql_host,
        user: this.mysql_user,
        password: this.mysql_password,
        database: this.mysql_database
    });
    var sql = ['CREATE TABLE IF NOT EXISTS`' + this.UsersTable + '` (\n' +
        '  `id` int(6) unsigned zerofill NOT NULL AUTO_INCREMENT,\n' +
        '  `name` varchar(255) NOT NULL,\n' +
        '  `twitch` varchar(255) NOT NULL,\n' +
        '  `twitch_id` int(12) DEFAULT NULL,\n' +
        '  `discord` varchar(255) NOT NULL,\n' +
        '  `youtube` varchar(255) DEFAULT NULL,\n' +
        '  `email` varchar(255) NOT NULL,\n' +
        '  `event` varchar(6) NOT NULL,\n' +
        '  `howdidyouhear` varchar(25555) NOT NULL,\n' +
        '  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
        '  `confirmation` varchar(50) NOT NULL,\n' +
        '  `image` varchar(500) DEFAULT NULL,\n' +
        '  PRIMARY KEY (`id`)\n' +
        ') ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=latin1', 'CREATE TABLE IF NOT EXISTS`' + this.EventsTable + '` (\n' +
        '  `id` int(6) unsigned zerofill NOT NULL AUTO_INCREMENT,\n' +
        '  `name` varchar(255) NOT NULL,\n' +
        '  `description` varchar(25555) NOT NULL,\n' +
        '  `image` varchar(255) NOT NULL,\n' +
        '  `game` int(6) NOT NULL,\n' +
        '  `slug` varchar(25) NOT NULL,\n' +
        '  `datetime` datetime DEFAULT NULL,\n' +
        '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
        '  PRIMARY KEY (`id`),\n' +
        '  UNIQUE KEY `slug` (`slug`)\n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1', 'CREATE TABLE IF NOT EXISTS`' + this.CompetitorsTable + '` (\n' +
    '  `id` int(6) unsigned zerofill NOT NULL AUTO_INCREMENT,\n' +
    '  `entrant` int(6) unsigned zerofill NOT NULL,\n' +
    '  `event` int(6) unsigned zerofill NOT NULL,\n' +
    "  `winner` tinyint(1) NOT NULL DEFAULT '0',\n" +
    '  PRIMARY KEY (`id`,`event`)\n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1'];
    sql.forEach(element => {
        con.query(element, function (err, result) {
            if (err) throw err;
        });
    });

}