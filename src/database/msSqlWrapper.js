import {Connection, Request} from "tedious";

let dbConnection = null;

//TODO: Datenbankverbindung offen halten, statt jedes Mal zu schließen?

function query(queryString, callback) {

    if (dbConnection == null) {
        initConnection(queryString, callback);
    }
    else {
        executeSql(queryString, callback);
    }
}

function initConnection(query, callback) {
    console.log("Initializing DB connection");

    dbConnection = new Connection({
        userName: 'vini@vini.database.windows.net',
        password: 't51sy9RbdohKsa',
        server: 'vini.database.windows.net',
        options: {
            encrypt: true,
            database: 'vini-database'
        }
    });

    dbConnection.on('connect', (err) => {
        if (err) {
            console.log("Unable to connect to database!", err);
        }
        else {
            console.log("Successfully connected to DB");
            executeSql(query, callback);
        }
    });

    dbConnection.on('end', () => {
        console.log("DB connection has been closed.");
        dbConnection = null;
    })
}

function executeSql(query, callback) {
    console.log("Begin query.");
    let resultValues = [];
    let hasError = false;

    const request = new Request(query, (err, rowCount) => {
        hasError = err;
        if (err) {
            console.log("Error while request was performed: ", err);
            return;
        }
        else {
            console.log("Got", rowCount, "row(s)");
        }
        dbConnection.close();
    });

    request.on('requestCompleted', () => {
        callback(hasError, resultValues);
    });

    request.on('row', (columns) => {
        // This collects all non-null rows in an array
        columns.forEach((column) => {
            if (column.value != null) {
                resultValues.push(column.value);
            }
        });
    });

    request.on('error', (err) => {
        console.log("Error while executing ", query); // Might not be secure
        hasError = true
    });

    dbConnection.execSql(request);
    console.log("End of query.")
}


module.exports = {
    "query": query
};