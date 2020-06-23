var fs = require('fs');
var http = require('http');
var https = require('https');

var finalhandler = require('finalhandler')

var express = require('express');
var app = express();
var socketIO = require('socket.io');
var serveStatic = require('serve-static');

const server = http.createServer(function (req, res) {
}).listen(process.env.PORT || 80);

const io = socketIO(server);

console.log("Updated 2");

groupServer(1);
groupServer(2);
groupServer(3);

function groupServer(groupNum) {

    let totalPlayersOnline = 0;
    let playerIDs = [];
    let playerIDToSocket = {};
    let currentGamePlayerIDs = [];
    let whosTurn = 0;
    let gameState = {
        "currentGame": "home",
        "playerOrderPosition": 0
    };
    let playerOrder = [];
    let gameEndedTimeout = null;
    let SequentialStack = "Sequential Stack";
    let MatchTheBatch = "Match The Batch";

    let MatchTheBatchServer = require('./Games/MatchTheBatchServer.js')(
        UpdatedGameState, getTimeRemaining, sendMessageToAll, NextPlayersTurn, mod, resetGamestate,
        loadJSON, saveJSON, SequentialStack, MatchTheBatch, epochSeconds, shuffle,
        gameState, playerIDToSocket, playerOrder, resetArray, showSuccessScreen,
    );
    let SequentialStackServer = require('./Games/SequentialStackServer.js')(
        UpdatedGameState, getTimeRemaining, sendMessageToAll, NextPlayersTurn, mod, resetGamestate,
        loadJSON, saveJSON, SequentialStack, MatchTheBatch, epochSeconds, shuffle,
        gameState, playerIDToSocket, playerOrder, resetArray, showSuccessScreen,
    );

    let GameServers = [MatchTheBatchServer, SequentialStackServer];

    let CurrentGameServer;

    io.of("group-" + groupNum).on('connection', socket => {
        let loggedIn = false;
        let isAdmin = false;
        let playerID = getNextPlayerID();
        playerIDs.push(playerID);
        playerIDToSocket[playerID] = socket;

        socket.emit("FromAPI", "hi");

        socket.on("login", function (data) {
            console.log("login");
            console.log(data);

            checkLogin(data, function (successfullyLoggedIn, retrievedIsAdmin, adminPassword, userPassword) {
                loggedIn = successfullyLoggedIn;
                isAdmin = retrievedIsAdmin;
                console.log("LoggedIn: " + loggedIn);

                if (loggedIn) {

                    let LoggedInResponse = { isAdmin, gameState };

                    SequentialStackServer.PlayerLoggedIn(socket, playerID, isAdmin, LoggedInResponse, function () {
                        MatchTheBatchServer.PlayerLoggedIn(socket, playerID, isAdmin, LoggedInResponse, function () {
                            socket.emit("LoggedIn", LoggedInResponse);
                        });
                    });


                    if (!isAdmin) {
                        totalPlayersOnline += 1;
                        updatedTotalPlayersOnline();
                    }

                } else {
                    console.log("Emitting login failed");
                    socket.emit("LoginFailed");
                }
            });

        });

        socket.on("disconnect", function () {
            console.log("User disconnected");

            if (!isAdmin && loggedIn) {
                totalPlayersOnline -= 1;
                updatedTotalPlayersOnline();
            }

            if (isAdmin) {
                StartNewGame("home");
            }

            playerDisconnected(playerID);
        });

        socket.on("StartPlaying", function (data) {

            if (isAdmin && loggedIn) {
                let newGame = data.newGame;

                if (newGame != gameState.currentGame) {
                    StartNewGame(newGame);
                }
            }

        });

        socket.on("startGame", function (data) {
            if (isAdmin) {
                if (CurrentGameServer.StartGame != null) {
                    CurrentGameServer.StartGame();
                }
            }
        });

        socket.on("GameMove", function (data) {
            PlayerGameMove(isAdmin, loggedIn, playerID, data);
        });

    });

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }


    function resetGamestate() {
        // Taken from https://stackoverflow.com/questions/684575/how-to-quickly-clear-a-javascript-object

        for (let member in gameState) delete gameState[member];

        gameState.playerOrderPosition = 0;
    }

    function resetArray(arr) {
        while (arr.length > 0) {
            arr.pop();
        }
    }

    function PlayerGameMove(isAdmin, loggedIn, playerID, data) {
        if (isAdmin) {

            // The admin never plays

            playerIDToSocket[playerID].emit("AdminCantPlay");

            return;
        }

        let alreadyMoved = true;

        if (playerOrder.includes(playerID)) {
            alreadyMoved = false;
        }

        if (alreadyMoved && CurrentGameServer.CanGoToNewPlayer()) {
            playerOrder.splice(gameState.playerOrderPosition, 0, playerID);
            alreadyMoved = false;
        }

        gameState.playerOrderPosition = mod(gameState.playerOrderPosition, playerOrder.length);


        if ((playerOrder[gameState.playerOrderPosition] != playerID)
            || CurrentGameServer.IsWrongOrder(playerOrder, gameState.playerOrderPosition, playerID, alreadyMoved)) {

            CurrentGameServer.GameMoveWrongOrderNotification(playerID);

            console.log("GameMoveWrongOrderNotification");
            return;
        }


        if (!gameState.CountdownActive) {
            //Countdown starts after first move

            gameState.CountdownActive = true;

            let gameLength = CurrentGameServer.GameLength;

            console.log("CountdownActive");
            gameState.timeOfGameEnd = (epochSeconds() + gameLength);
            gameState.timeRemaining = getTimeRemaining();

            timeoutAfter(gameLength);

        }

        CurrentGameServer.PlayerGameMove(data);
    }

    function showSuccessScreen() {

        gameState.successScreen = true;
        clearTimeout(gameEndedTimeout);
        let totalSeconds = CurrentGameServer.GameLength - getTimeRemaining();

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds - minutes * 60;

        let minuteTxt = " minutes";
        let secondTxt = " seconds";
        if (minutes == 1) {
            minuteTxt = " minute";
        }
        if (seconds == 1) {
            secondTxt = " second";
        }

        gameState.completedInText = "Completed in " + minutes + minuteTxt + " and " + seconds + secondTxt;

        if (minutes == 0) {
            gameState.completedInText = "Completed in only " + seconds + " seconds";
        }

        setTimeout(function () {
            UpdatedGameState();

            setTimeout(
                function () {
                    resetGamestate();
                    gameState.currentGame = "Home";
                    UpdatedGameState();
                }, 7000);

        }, 1000);

    }

    function NextPlayersTurn() {
        gameState.playerOrderPosition = gameState.playerOrderPosition + 1;
    }

    function timeoutAfter(seconds) {
        gameEndedTimeout = setTimeout(function () {


            gameState.ranOutOfTimeScreen = true;

            setTimeout(function () {
                UpdatedGameState();

                setTimeout(
                    function () {
                        resetGamestate();
                        gameState.currentGame = "Home";
                        UpdatedGameState();
                    }, 5000);

            }, 500);

        }, (seconds + 1) * 1000);
    }

    function epochSeconds() {
        return Math.floor(new Date() / 1000);
    }

    function getTimeRemaining() {
        return gameState.timeOfGameEnd - epochSeconds();
    }

    function UpdatedGameState() {
        if (CurrentGameServer != null && CurrentGameServer.UpdatedGameState != null) {
            CurrentGameServer.UpdatedGameState();
        }

        console.log("UpdatedGameState: " + JSON.stringify(gameState));

        sendMessageToAll("UpdatedGameState", { gameState });
    }

    function StartNewGame(newGame) {
        clearTimeout(gameEndedTimeout);
        whosTurn = 0;
        gameState.playing = false;
        gameState.currentGame = newGame;
        gameState.playerOrderPosition = 0;

        if (newGame == SequentialStack) {
            CurrentGameServer = SequentialStackServer;
        }
        else if (newGame == MatchTheBatch) {
            CurrentGameServer = MatchTheBatchServer;
        }


        UpdatedGameState();
        currentGamePlayerIDs = [];
    }

    function sendMessageToAll(event, data) {
        for (let i = 0; i < playerIDs.length; i++) {
            playerIDToSocket[playerIDs[i]].emit(event, data);
        }
    }

    function sendMessageToAllCurrentPlayers(event, data) {
        for (let i = 0; i < currentGamePlayerIDs.length; i++) {
            playerIDToSocket[currentGamePlayerIDs[i]].emit(event, data);
        }
    }

    function updatedTotalPlayersOnline() {
        console.log("updatedTotalPlayersOnline: " + totalPlayersOnline);
        if (gameState.currentGame == "Match The Batch") {
            gameState.timeRemaining = getTimeRemaining();
        }
        for (let i = 0; i < playerIDs.length; i++) {
            playerIDToSocket[playerIDs[i]].emit("totalPlayersOnline", { totalPlayersOnline, gameState });
        }
    }

    function playerDisconnected(playerID) {
        removeFromArray(playerIDs, playerID);
        removeFromArray(currentGamePlayerIDs, playerID);
        removeFromArray(playerOrder, playerID);

        for (let i = 0; i < GameServers.length; i++) {
            if (GameServers[i].playerDisconnected != null) {
                GameServers[i].playerDisconnected(playerID);
            }
        }
    }

    function removeFromArray(array, value) {
        const index = array.indexOf(value);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    function getNextPlayerID() {
        let playerID = 0;
        let preventEndlessLoop = 1000;

        do {
            playerID = Math.floor(Math.random() * 1000);
        } while (playerIDs.includes(playerID) && preventEndlessLoop-- > 0);

        return playerID;
    }

    function checkLogin(password, returnFunction) {
        console.log("checkLogin");
        loadJSON("AdminPassword", function (err, adminPasswordHolder) {

            let adminPassword = "admin";

            if (!err) {
                adminPassword = adminPasswordHolder.password;
            }

            loadJSON("Password", function (err, userPasswordHolder) {

                let userPassword = "user";

                if (!err) {
                    userPassword = userPasswordHolder.password;
                }

                if (adminPassword == password) {
                    let isAdmin = true;
                    returnFunction(true, isAdmin, adminPassword, userPassword);
                } else if (userPassword == password) {
                    let isAdmin = false;
                    returnFunction(true, isAdmin);
                } else {
                    returnFunction(false);
                }

            });

        });
    };

    function mod(n, m) {
        if (m == 0) {
            return 0;
        }
        return ((n % m) + m) % m;
    }

    function saveJSON(name, json) {
        fs.writeFile("/tmp/" + name + ".txt", JSON.stringify(json), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

    function loadJSON(name, returnFunction) {
        fs.readFile("/tmp/" + name + ".txt", "utf-8", function (err, data) {
            if (err) {
                console.log("loadJSON " + name + " error:");
                returnFunction(true);
            } else {
                returnFunction(false, JSON.parse(data));
            }
        });
    }


};