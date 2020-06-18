var fs = require('fs');
var http = require('http');
var https = require('https');

var finalhandler = require('finalhandler')

var express = require('express');
var app = express();
var socketIO = require('socket.io');
var serveStatic = require('serve-static')

console.log("a");

const server = http.createServer(function (req, res) {
    res.send("hi");
}).listen(process.env.PORT || 80);

console.log("b process.env.PORT: " + process.env.PORT);

const io = socketIO(server);

groupServer(1);
groupServer(2);
groupServer(3);

console.log("c3345b2a");

function groupServer(groupNum) {

    console.log("d");

    let totalPlayersOnline = 0;
    let playerIDs = [];
    let playerIDToSocket = {};
    let currentGamePlayerIDs = [];
    let whosTurn = 0;
    let wordsOnLeft = [];
    let wordsOnRight = [];
    let batchWords = [];
    let gameState = { "currentGame": "home" };
    let sequentialStackGameLength = 60 * 5;
    let batchGameLength = 60 * 5;
    let playerOrder = [];
    let playerOrderPosition = 0;
    let gameEndedTimeout = null;
    let SequentialStack = "Sequential Stack";
    let MatchTheBatch = "Match The Batch";

    let SequentialStackCurrentBlock = 0;
    let TotalSequentialPlayerBlocks = 5;
    let CorrectSequentialStackMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 20, 20, 20];
    let SequentialStackCurrentMove = 0;


    console.log("of group-" + groupNum);

    io.of("group-" + groupNum).on('connection', socket => {
        let loggedIn = false;
        let isAdmin = false;
        let playerID = getNextPlayerID();
        playerIDs.push(playerID);
        playerIDToSocket[playerID] = socket;

        console.log("aaa_2");

        socket.emit("FromAPI", "hi");

        socket.on("login", function (data) {
            console.log("login");
            console.log(data);

            checkLogin(data, function (successfullyLoggedIn, retrievedIsAdmin, adminPassword, userPassword) {
                loggedIn = successfullyLoggedIn;
                isAdmin = retrievedIsAdmin;
                console.log("loggedIn: " + loggedIn);

                if (loggedIn) {
                    if (isAdmin) {
                        getSavedBatchWords(function (savedBatchWords) {
                            console.log("emitting LoggedIn");
                            socket.emit("LoggedIn", { isAdmin, adminPassword, userPassword, gameState, savedBatchWords });

                            isAdmin = true;

                            totalPlayersOnline += 0;
                            updatedTotalPlayersOnline();
                        });
                    } else {
                        console.log("emitting LoggedIn");
                        socket.emit("LoggedIn", { isAdmin, gameState });
                        isAdmin = false;

                        totalPlayersOnline += 1;
                        updatedTotalPlayersOnline();
                    }
                } else {
                    console.log("emitting login failed");
                    socket.emit("LoginFailed");
                }
            });

        });

        socket.on("disconnect", function () {
            console.log("user disconnected");

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
                if (gameState.currentGame == SequentialStack) {
                    StartPlayingSequentialStack();
                }
            }
        });

        socket.on("startBatchWordGame", function (data) {
            if (isAdmin) {
                console.log("start batch data: " + data);
                console.log(JSON.stringify(data));
                let wordData = data.words;
                saveBatchWords(wordData);
                if (wordData != null) {
                    let words = wordData.split(",");
                    for (let i = 0; i < words.length; i++) {
                        words[i] = words[i].trim();
                    }
                    if (words.length == 12) {
                        batchWords = words;


                        shuffle(batchWords);
                        let batchWordsRightSide = JSON.parse(JSON.stringify(batchWords));

                        shuffle(batchWordsRightSide);

                        while (batchWordsRightSide.length > 0) {
                            batchWords.push(batchWordsRightSide.pop());
                        }

                        StartPlayingMatchBatch();

                    } else {
                        socket.emit("ErrorSettingBatchWords");
                    }
                } else {
                    socket.emit("ErrorSettingBatchWords");
                }
            }
        });

        socket.on("adminChoseMatchTheBatchWords", function (data) {
            console.log("adminChoseMatchTheBatchWords: " + data.words);
        });

        socket.on("GameMove", function (data) {
            PlayerGameMove(isAdmin, loggedIn, playerID, data);
        });

    });


    function saveBatchWords(words) {
        saveJSON("batchWords", { words });
    }

    function getSavedBatchWords(returnFunction) {
        loadJSON("batchWords", function (err, wordsHolder) {
            if (err) {
                returnFunction("");
            } else {
                let words = wordsHolder.words;
                if (words.length == 0) {
                    words = "";
                }
                returnFunction(words);
            }
        });
    }

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const newLocal = "Sequential Stack";
    function PlayerGameMove(isAdmin, loggedIn, playerID, data) {
        if (isAdmin) {
            // The admin never plays

            playerIDToSocket[playerID].emit("AdminCantPlay");

            return;
        }





        let alreadyMoved = true;

        if (!playerOrder.includes(playerID)
            && ((gameState.pickedA == null && gameState.pickedB == null))) {
            playerOrder.splice(playerOrderPosition, 0, playerID);
            alreadyMoved = false;
        }

        console.log("game move playerOrderPosition a1: " + playerOrderPosition + ", " + playerOrder.length + ", " + JSON.stringify(playerOrder));
        playerOrderPosition = mod(playerOrderPosition, playerOrder.length);
        console.log("game move playerOrderPosition b: " + playerOrderPosition);

        if ((playerOrder[playerOrderPosition] != playerID)
            || ((gameState.pickedA != null || gameState.pickedB != null) && playerOrder[playerOrderPosition] != playerID)
            || (gameState.pickedA == null && gameState.pickedB == null && alreadyMoved && playerOrder.length < totalPlayersOnline)) {

            console.log("NotYourTurn gameState.currentGame: " + gameState.currentGame);

            if (gameState.currentGame == MatchTheBatch) {
                playerIDToSocket[playerID].emit("NotYourTurn");
                console.log("emitting NotYourTurn");
            } else if (gameState.currentGame == SequentialStack) {
                sendMessageToAll("WrongMove");
                console.log("emitting WrongMove");
                SetupSequentialStack();
            }

            return;
        }


        if (!gameState.CountdownActive) {
            gameState.CountdownActive = true;

            let gameLength = 0;
            if (gameState.currentGame == SequentialStack) {
                gameLength = sequentialStackGameLength;
            }
            if (gameState.currentGame == MatchTheBatch) {
                gameLength = batchGameLength;
            }

            console.log("CountdownActive");
            gameState.timeOfGameEnd = (epochSeconds() + gameLength);
            gameState.timeRemaining = getTimeRemaining();

            timeoutAfter(gameLength);

        }

        if (data.type == "revealWord") {
            let index = data.index;
            if (!gameState.revealed[index]
                && ((gameState.pickedA == null && index < 12)
                    || (gameState.pickedB == null && index >= 12))) {
                if (index < 12) {
                    gameState.pickedA = index;

                    if (gameState.putBackA == index) {
                        gameState.putBackA = null;
                    }
                } else {
                    gameState.pickedB = index;

                    if (gameState.putBackB == index) {
                        gameState.putBackB = null;
                    }
                }

                let waitTime = 2000;

                if (gameState.pickedA != null && gameState.pickedB != null
                    && gameState.batchWords[gameState.pickedA] == gameState.batchWords[gameState.pickedB]) {
                    waitTime = 1000;
                }

                if (gameState.pickedA != null && gameState.pickedB != null) {
                    NextPlayersTurn();
                }

                if (gameState.pickedA != null && gameState.pickedB != null) {
                    setTimeout(function () {
                        if (gameState.pickedA != null && gameState.pickedB != null) {
                            if (gameState.batchWords[gameState.pickedA] != gameState.batchWords[gameState.pickedB]) {
                                //Wrong guess

                                gameState.putBackA = gameState.pickedA;
                                gameState.putBackB = gameState.pickedB;
                                gameState.pickedA = null;
                                gameState.pickedB = null;
                            } else {
                                //Correct Guess
                                gameState.score += 10;
                                if (gameState.dissolveA != null) {
                                    gameState.revealed[gameState.dissolveA] = true;
                                }
                                if (gameState.dissolveB != null) {
                                    gameState.revealed[gameState.dissolveB] = true;
                                }
                                gameState.dissolveA = gameState.pickedA;
                                gameState.dissolveB = gameState.pickedB;
                                gameState.pickedA = null;
                                gameState.pickedB = null;

                                let totalRevealed = 0;
                                for (let i = 0; i < 24; i++) {
                                    if (gameState.revealed[i]) {
                                        totalRevealed += 1;
                                    }
                                }
                                if (totalRevealed == 22) {
                                    showSuccessScreen();
                                }

                            }
                            UpdatedGameState();
                        }
                    }, waitTime);
                }

                UpdatedGameState();
            }
        }

        if (data.type == "SequentialStackMoveTo") {
            if (CorrectSequentialStackMoves[SequentialStackCurrentMove] == data.index) {
                gameState.blocks[SequentialStackCurrentBlock].index = data.index;

                if (SequentialStackCurrentMove >= 19) {
                    SequentialStackCurrentBlock = mod(SequentialStackCurrentBlock - 1, TotalSequentialPlayerBlocks);
                } else {
                    SequentialStackCurrentBlock = mod(SequentialStackCurrentBlock + 1, TotalSequentialPlayerBlocks);
                }

                SequentialStackCurrentMove += 1;

                NextPlayersTurn();

                UpdatedGameState();

                if (SequentialStackCurrentMove == 24) {
                    showSuccessScreen();
                }

            } else {
                console.log("sending to all: WrongMove");
                sendMessageToAll("WrongMove");
                SetupSequentialStack();
            }

        }

    }

    function showSuccessScreen() {

        gameState.successScreen = true;
        clearTimeout(gameEndedTimeout);
        let totalSeconds = batchGameLength - getTimeRemaining();

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
                    gameState = {};
                    gameState.currentGame = "Home";
                    UpdatedGameState();
                }, 7000);

        }, 1000);

    }

    function NextPlayersTurn() {
        playerOrderPosition = playerOrderPosition + 1;
    }

    function StartPlayingSequentialStack() {
        gameState = {};
        gameState.currentGame = SequentialStack;
        gameState.playing = true;
        playerOrder = [];
        gameState.timeOfGameEnd = (epochSeconds() + sequentialStackGameLength);
        gameState.timeRemaining = getTimeRemaining();

        SetupSequentialStack();
    }

    function SetupSequentialStack() {
        console.log("SetupSequentialStack");
        playerOrderPosition = playerOrder.length;

        let blocks = [];
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });

        SequentialStackCurrentBlock = 0;
        SequentialStackCurrentMove = 0;

        gameState.blocks = blocks;

        UpdatedGameState();
    }

    function StartPlayingMatchBatch() {
        gameState = {};
        gameState.batchWords = batchWords;
        gameState.currentGame = MatchTheBatch;
        gameState.playing = true;
        gameState.pickedA = null;
        gameState.pickedB = null;
        gameState.score = 0;
        playerOrderPosition = 0;
        playerOrder = [];
        gameState.timeOfGameEnd = (epochSeconds() + batchGameLength);
        gameState.timeRemaining = getTimeRemaining();
        gameState.revealed = [];
        for (let i = 0; i < 24; i++) {
            gameState.revealed.push(false);
        }
        UpdatedGameState();
    }

    function timeoutAfter(seconds) {
        gameEndedTimeout = setTimeout(function () {


            gameState.ranOutOfTimeScreen = true;

            setTimeout(function () {
                UpdatedGameState();

                setTimeout(
                    function () {
                        gameState = {};
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
        if (gameState.currentGame == "Match The Batch") {
            gameState.timeRemaining = getTimeRemaining();
        }

        console.log("UpdatedGameState: " + JSON.stringify(gameState));
        sendMessageToAll("UpdatedGameState", { gameState });
    }

    function StartNewGame(newGame) {
        clearTimeout(gameEndedTimeout);
        whosTurn = 0;
        gameState.playing = false;
        gameState.currentGame = newGame;

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