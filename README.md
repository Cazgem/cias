# cias

```javascript
npm install cias

//Required Dependencies

npm install mysql
npm install tmi.js
```

This library is meant to act as a twitch bot extension to allow for the smooth management and performance of Games in a Snap and other E-Sport events.

## BEFORE YOU BEGIN
Make a MySQL database table with at least two columns, number and name to correspond to the four participant spots. This will be more flexible in the future, but for now this is how it is.


Then run the `twitchCPR.list` function (details below) to get your individual reward IDs.

## Implementation

### Includes
```javascript

const tmi = require('tmi.js'); // Recommended for chat functionality, though not strictly necessary to function.
const mysql = require(`mysql`);
const config = require('./config'); // Great to store variables safely
```

### Building the Config
```javascript
    const ciasOPTS = {
        OBSaddress: config.default.obs_address, //Your Host Computer's IP address and websocket port no. (4444 by default)
        OBSpassword: config.default.obs_pass, // Your OBS websocket password (If it exists!)
        MYSQLhost: config.mysql.host, // The location of your database (either localhost, or an IP address if a different server location)
        MYSQLuser: config.mysql.user, // MySQL Username
        MYSQLpassword: config.mysql.password, // MySQL Password
        MYSQLdatabase: config.mysql.database, // MySQL Database Name
        MYSQLtable: `CiaS_Participants` // Participants table name within your database
    }
```

## USE

### Announcements
Announces the input text to all participants in an event.

```javascript
cias.announce(client, msg, context, channel, ciasOPTS);
```

### Participants
Calls and Alters the Participant Database.

```javascript
cias.participants(client, params, context, channel, ciasOPTS);
```

### Ten Seconds Remaining
Calls and Alters the Participant Database.

```javascript
cias.tenseconds(client, ciasOPTS);
```

### Starting Timer (30 seconds)
Calls and Alters the Participant Database.

```javascript
cias.starting(client, ciasOPTS);
```


Developed by Cazgem (https://twitch.tv/cazgem) for use as part of cities in a snap (https://twitch.tv/citiesinasnap) as well as for his chatbot, Polyphony.