module.exports = function (UpdatedGameState, getTimeRemaining, sendMessageToAll, NextPlayersTurn, mod,
    resetGamestate, loadJSON, saveJSON, SequentialStack, MatchTheBatch, epochSeconds, shuffle,
    gameState, playerIDToSocket, playerOrder, resetArray, showSuccessScreen,
) {
    var module = {};

    module.GameLength = 60 * 5;

    let SequentialStackCurrentBlock = 0;
    let TotalSequentialPlayerBlocks = 5;
    let CorrectSequentialStackMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 20, 20, 20];
    let SequentialStackCurrentMove = 0;


    module.UpdatedGameState = function () {

    };

    module.PlayerLoggedIn = function (socket, playerID, isAdmin, LoggedInResponse, continueLogin) {

        continueLogin();
    }

    module.PlayerDisconnected = function (playerID) {

    }

    module.CanGoToNewPlayer = function () {
        return true;
    }

    module.GameMoveWrongOrderNotification = function (playerID) {
        sendMessageToAll("WrongMove");
        SetupSequentialStack(gameState);
    }

    module.IsWrongOrder = function (playerOrder, playerOrderPosition, playerID, alreadyMoved) {
        return false;
    }

    module.StartGame = function () {
        resetGamestate();
        gameState.currentGame = SequentialStack;
        gameState.playing = true;
        gameState.timeOfGameEnd = (epochSeconds() + module.GameLength);
        gameState.timeRemaining = getTimeRemaining();

        SetupSequentialStack(gameState);
    }

    module.PlayerGameMove = function (data) {

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



    function SetupSequentialStack() {
        console.log("SetupSequentialStack");
        gameState.playerOrderPosition = playerOrder.length;

        console.log("set gamestate order position to " + playerOrder.length);

        let blocks = [];
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });
        blocks.push({ "index": 0 });

        resetArray(playerOrder);

        SequentialStackCurrentBlock = 0;
        SequentialStackCurrentMove = 0;

        gameState.blocks = blocks;

        UpdatedGameState();
    }

    return module;
};