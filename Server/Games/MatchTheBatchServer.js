module.exports = function (UpdatedGameState, getTimeRemaining, sendMessageToAll, NextPlayersTurn, mod,
    resetGamestate, loadJSON, saveJSON, SequentialStack, MatchTheBatch, epochSeconds, shuffle,
    gameState, playerIDToSocket, playerOrder, resetArray, showSuccessScreen,
) {
    var module = {};

    module.GameLength = 60 * 5;

    let batchWords = [];


    module.UpdatedGameState = function () {
        gameState.timeRemaining = getTimeRemaining();
    };

    module.CanGoToNewPlayer = function () {
        return gameState.pickedA == null && gameState.pickedB == null;
    }

    module.PlayerLoggedIn = function (socket, playerID, isAdmin, LoggedInResponse, continueLogin) {

        if (isAdmin) {
            getSavedBatchWords(function (savedBatchWords) {
                LoggedInResponse.savedBatchWords = savedBatchWords;
                continueLogin();
            });
        } else {
            continueLogin();
        }


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

                        StartPlayingMatchBatch(gameState);

                    } else {
                        socket.emit("ErrorSettingBatchWords");
                    }
                } else {
                    socket.emit("ErrorSettingBatchWords");
                }
            }
        });

    }

    module.IsWrongOrder = function (playerOrder, playerOrderPosition, playerID, alreadyMoved) {
        return ((gameState.pickedA != null || gameState.pickedB != null) && playerOrder[playerOrderPosition] != playerID)
            || (gameState.pickedA == null && gameState.pickedB == null && alreadyMoved);
    }

    module.GameMoveWrongOrderNotification = function (playerID) {
        playerIDToSocket[playerID].emit("NotYourTurn");
    }

    module.PlayerGameMove = function (data) {

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
    }

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

    function StartPlayingMatchBatch() {
        resetGamestate();
        gameState.batchWords = batchWords;
        gameState.currentGame = MatchTheBatch;
        gameState.playing = true;
        gameState.pickedA = null;
        gameState.pickedB = null;
        gameState.score = 0;
        gameState.playerOrderPosition = 0;
        resetArray(playerOrder);
        gameState.timeOfGameEnd = (epochSeconds() + module.GameLength);
        gameState.timeRemaining = getTimeRemaining();
        gameState.revealed = [];
        for (let i = 0; i < 24; i++) {
            gameState.revealed.push(false);
        }
        UpdatedGameState();
    }

    return module;
};