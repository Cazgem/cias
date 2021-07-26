# cias

```javascript
npm install cias

//Required Dependencies

npm install mysql
npm install tmi.js
```

This library is meant to act as a twitch bot extension to allow for the smooth management and performance of Games in a Snap and other E-Sport events. It originally was written for the "Cities in a Snap" event, which Games in a Snap grew out of.

## BEFORE YOU BEGIN
Reserved.

## Implementation

### Includes
```javascript

const mysql = require(`mysql`);     // Requirement
const tmi = require('tmi.js');      // Recommended for chat functionality, though not strictly necessary to function.
const config = require('./config'); // Recommended to store variables safely
```

### Building the Config
```javascript
    const ciasOPTS = {
        initialize: true,                           // Required true/false to initialize DB and Table automatically using the parameters given. Recommended for first use.
        MYSQLhost: `path.to.host`,                  // Required
        MYSQLuser: `sqlUser`,                       // Required
        MYSQLpassword: `sqlPassword`,               // Required
        MYSQLdatabase: `<db_name>`,                 // Required
        EventsTable: `<events_table>`,              // Required
        CompetitorsTable: `<competitors_table>`,    // Required
        UsersTable: `<UsersRegistration_table>`,    // Required
        channel: `<YourChannel>`                    // Required
    }
```

## USE

### Announcements
Announces the input text to all participants in an event.

```javascript
cias.announce(channel, msg);
```

### Route
Announces the input text to a single participant as specified.

```javascript
cias.announce(participant, msg);
```

### Join
Same as tmi.js client.join(), but cycles through current participants.

```javascript
cias.join();
```

### Part
Same as tmi.js client.part(), but cycles through current participants.

```javascript
cias.part();
```

### Participant
Returns single Participant object based on the number given for the event in question.

```javascript
cias.participant(participant, callback);
```

### Participants
Returns All Participants as objects based on the event in question.

```javascript
cias.participants(callback);
```

### Errors
Runs the CiaS Module's Error Module. (mostly for internal use)

```javascript
cias.error(err);
```

### Set Event Number
Sets the event number for the rest of the module to operate on. See the example for details on how to implement.

```javascript
cias.event_id = number;
```

### Timer
Manually runs the CiaS Module's Timer for a length of time (in minutes, float).

```javascript
cias.timer(channel, length);
```

### Ten Seconds Remaining
Calls the final 10 seconds sequence.

```javascript
cias.tenseconds(channel);
```

### Starting Timer (30 seconds)
Starts the event. Length (optional) is a value in minutes.

```javascript
cias.starting(channel, length);
```
Notes:
A length of 0 will result in the starting countdown running on its' own.
A valid, non-zero integer (or decimal) will result in the starting countdown followed by the event timer starting.
A length of 0 will result in the starting countdown running on its' own.


Developed by Cazgem (https://twitch.tv/cazgem) for use as part of cities in a snap, and Games in a Snap (https://twitch.tv/gamesinasnap) specifically for his chatbot, Polyphony.