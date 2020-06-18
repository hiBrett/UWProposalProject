import React, { Component } from 'react';
import NavigationBar from './NavigationBar';
import Welcome from './Welcome';
import EnterPassword from './EnterPassword';
import socketIOClient from "socket.io-client";
import Connecting from './Connecting';
import LoginFailed from './LoginFailed';
import SetPasswords from '../Security/SetPasswords';
import Saved from '../Security/Saved';
import LoggingIn from './LoggingIn';
import LoginAs from './LoginAs';
import TotalPlayersOnline from './TotalPlayersOnline';
import AdminChooseMatchTheBatchWords from '../MatchTheBatch/AdminChooseMatchTheBatchWords';
import ErrorSettingBatchWords from '../MatchTheBatch/ErrorSettingBatchWords';
import MatchTheBatch from '../MatchTheBatch/MatchTheBatch';
import TimeScoreBar from '../MatchTheBatch/TimeScoreBar';
import BatchInstructions from '../Instructions/BatchInstructions';
import BatchWinners from '../MatchTheBatch/BatchWinners';
import RanOutOfTime from '../MatchTheBatch/RanOutOfTime';
import SequentialStack from '../SequentialStack/SequentialStack';
import SequentialStackInstructions from '../Instructions/SequentialStackInstructions';
import AdminStartGame from '../SequentialStack/AdminStartGame';
import AdminCantPlay from '../Admin/AdminCantPlay';
const ENDPOINT = "http://35.237.81.98/";

export default class Home extends Component {
    constructor(props) {
        super(props);
        console.log("constructor");

        this.wrongSound = new Audio("./wrong-sound-fx.mp3");
        this.wrongSound.volume = 0.2;
        this.winSound = new Audio("./win-sound.mp3");

        

        this.state = {};
        this.state.connected = false;
    }


    componentDidMount() {
        console.log("component did mount");

        function httpGetAsync(theUrl, callback) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    callback(xmlHttp.responseText);
            }
            xmlHttp.open("GET", theUrl, true);
            xmlHttp.send(null);
        }

        let self = this;

        httpGetAsync("https://us-east1-brettyeagerdev.cloudfunctions.net/ConnectToUWProposalProject",
            function (ip) {
                
                console.log("window.location.href2: " + window.location.href);

                if (!window.location.href.includes("?group=")) {
                    window.location.replace(window.location.href + "?group=1");
                }

                for (let i = 0; i < 5; i++) {
                    if (window.location.href.includes("group=" + i)) {
                        ip += "/group-" + i;
                    }
                }

                console.log("ip3: " + ip);

                self.socket = socketIOClient("http://" + ip);


                self.socket.on("FromAPI", data => {
                    if (data == "hi") {
                        console.log(data);
                    } else {
                        alert(data);
                    }
                    self.state.connected = true;
                    self.setState(self.state);
                });

                self.socket.on("disconnect", function () {
                    console.log("disconnect");
                    self.state.connected = false;
                    self.state.LoggedIn = false;
                    self.state.isAdmin = false;
                    self.state.loggingIn = false;
                    self.setState(self.state);
                });

                self.socket.on("LoginFailed", function (data) {
                    self.state.LoginFailed = true;
                    self.state.LoggedIn = false;
                    self.state.isAdmin = false;
                    self.state.loggingIn = false;
                    self.setState(self.state);
                });

                self.socket.on("LoggedIn", function (data) {
                    self.state.LoggedIn = true;
                    self.state.isAdmin = data.isAdmin;
                    self.state.gameState = data.gameState;
                    self.state.loggingIn = false;
                    console.log("logged in");
                    if (self.state.isAdmin) {
                        self.state.adminPassword = data.adminPassword;
                        self.state.userPassword = data.userPassword;
                        self.state.savedBatchWords = data.savedBatchWords;
                        console.log("saved batch words: " + data.savedBatchWords);
                        console.log("self.state.adminPassword: " + self.state.adminPassword);
                    }
                    self.setState(self.state);
                });

                self.socket.on("UpdatedGameState", function (data) {
                    console.log("UpdatedGameState: " + JSON.stringify(data));
                    self.state.gameState = data.gameState;
                    if (self.state.gameState.successScreen) {
                        self.winSound.play();
                    }
                    self.setState(self.state);
                });

                self.socket.on("totalPlayersOnline", function (data) {
                    self.state.totalPlayersOnline = data.totalPlayersOnline;
                    self.state.gameState = data.gameState;
                    self.setState(self.state);
                });

                self.socket.on("SetPasswordsSuccess", function (data) {
                    self.state.setPasswordsSaved = true;
                    self.setState(self.state);
                });

                self.socket.on("adminChoseMatchTheBatchWordsError", function (data) {
                    self.state.adminChoseMatchTheBatchWordsError = true;
                    self.setState(self.state);
                });

                self.socket.on("StartPlaying", function (data) {
                    let newGame = data.newGame;

                    self.state.game = newGame;
                    self.setState(self.state);

                    console.log("newGame: " + newGame + ", self.state.game: " + self.state.game);
                });


                self.socket.on("StartPlayingMatchBatch", function (data) {
                    let batchWords = data.batchWords;

                    self.state.batchWords = batchWords;
                    self.setState(self.state);

                    console.log("batchWords: " + JSON.stringify(batchWords));
                });

                self.socket.on("ErrorSettingBatchWords", function () {
                    self.state.ErrorSettingBatchWords = true;
                    self.setState(self.state);
                });

                self.socket.on("NotYourTurn", function () {
                    self.wrongSound.play();
                });

                self.socket.on("WrongMove", function () {
                    self.wrongSound.play();
                });

                self.socket.on("AdminCantPlay", function () {
                    self.state.AdminCantPlay = true;
                    self.setState(self.state);

                    setTimeout(function () {
                        self.state.AdminCantPlay = false;
                        self.setState(self.state);
                    }, 6000);
                });

            });

    }


    updateUserPasswordText(event, home) {
        home.state.userPassword = event.target.value;
        home.setState(home.state);
        home.hidePasswordsSavedNotification(home);
    }
    updateAdminPasswordText(event, home) {
        home.state.adminPassword = event.target.value;
        console.log("setting admin password to " + home.state.adminPassword);
        home.setState(home.state);
        home.hidePasswordsSavedNotification(home);
    }
    updateAdminChooseBatchWords(event, home) {
        home.state.savedBatchWords = event.target.value;
        home.setState(home.state);

        if (home.state.ErrorSettingBatchWords) {
            home.state.ErrorSettingBatchWords = false;
            home.setState(home.state);
        }
    }
    hidePasswordsSavedNotification(home) {
        if (home.state.setPasswordsSaved) {
            home.state.setPasswordsSaved = false;
            home.setState(home.state);
        }
    }

    StartedEnteringNewPassword(home) {
        if (home.state.LoginFailed) {
            home.state.LoginFailed = false;
            home.setState(home.state);
        }
    }

    SubmitPassword(password, home) {
        home.socket.emit('login', password);
        home.state.loggingIn = true;
        home.setState(home.state);
    }

    SetNewPassword(admin, password, home) {
        home.socket.emit('setPassword', { admin, password });
    }

    StartBatchWordsGame(home) {
        let words = home.state.savedBatchWords;
        home.socket.emit("startBatchWordGame", { words });
    }

    StartGame(home) {
        home.socket.emit("startGame");
    }

    toggleShowPasswords(home) {
        home.state.showPasswords = !home.state.showPasswords;
        home.setState(home.state);
        home.hidePasswordsSavedNotification(home);
        console.log("toggleShowPasswords: " + home.state.showPasswords);
    }

    revealWord(home, index) {
        let type = "revealWord";
        home.gameMove(home, { index, type });
    }

    gameMove(home, data) {
        home.socket.emit("GameMove", data);
    }

    SubmitStartPlayingGame(home, newGame) {
        home.socket.emit('StartPlaying', { newGame });
    }

    moveSeq(home, index) {
        home.socket.emit("GameMove", { "type": "SequentialStackMoveTo", index });
    }

    render() {
        console.log("home state.savedBatchWords: " + this.state.savedBatchWords);
        if (this.state.gameState != null) {
            console.log("this.state.gameState.currentGame : " + this.state.gameState.currentGame);
        }
        if (this.state.connected) {
            return (
                <div>
                    <NavigationBar LoggedIn={this.state.LoggedIn} isAdmin={this.state.isAdmin} SubmitStartPlayingGame={this.SubmitStartPlayingGame} gameState={this.state.gameState} home={this} />

                    <div className="container  align-items-center">

                        <Welcome Show={!this.state.LoggedIn && !this.state.loggingIn} />
                        <LoginAs as="admin" SubmitPassword={this.SubmitPassword} Show={!this.state.LoggedIn && !this.state.loggingIn} home={this} />
                        <LoginAs as="user" SubmitPassword={this.SubmitPassword} Show={!this.state.LoggedIn && !this.state.loggingIn} home={this} />

                        <LoginFailed Show={this.state.LoginFailed} />
                        <LoggingIn Show={this.state.loggingIn} />

                        <TotalPlayersOnline Show={this.state.LoggedIn && (this.state.isAdmin || !this.state.gameState.playing)} playing={this.state.gameState != null && this.state.gameState.playing} totalPlayersOnline={this.state.totalPlayersOnline} isAdmin={this.state.isAdmin} />

                        <AdminChooseMatchTheBatchWords Show={this.state.LoggedIn && this.state.gameState.currentGame == "Match The Batch" && this.state.isAdmin && !this.state.gameState.playing} updateAdminChooseBatchWords={this.updateAdminChooseBatchWords} StartBatchWordsGame={this.StartBatchWordsGame} savedBatchWords={this.state.savedBatchWords} home={this} />
                        <AdminStartGame Show={this.state.LoggedIn && this.state.gameState.currentGame == "Sequential Stack" && this.state.isAdmin && !this.state.gameState.playing} StartGame={this.StartGame} StartBatchWordsGame={this.StartBatchWordsGame} home={this} />
                        <ErrorSettingBatchWords Show={this.state.LoggedIn && this.state.ErrorSettingBatchWords} />

                        <BatchInstructions Show={this.state.gameState != null && this.state.gameState.currentGame == "Match The Batch" && this.state.LoggedIn && !this.state.gameState.playing} />
                        <SequentialStackInstructions Show={this.state.gameState != null && this.state.gameState.currentGame == "Sequential Stack" && this.state.LoggedIn && !this.state.gameState.playing} />
                        
                        <MatchTheBatch Show={this.state.gameState != null && this.state.gameState.currentGame == "Match The Batch" && this.state.LoggedIn && this.state.gameState.playing} gameState={this.state.gameState} revealWord={this.revealWord} home={this} />
                        <SequentialStack moveSeq={this.moveSeq} Show={this.state.gameState != null && this.state.gameState.currentGame == "Sequential Stack" && this.state.LoggedIn && this.state.gameState.playing} gameState={this.state.gameState} home={this} />

                        <BatchWinners Show={this.state.gameState != null && this.state.gameState.successScreen} gameState={this.state.gameState} />
                        <RanOutOfTime Show={this.state.gameState != null && this.state.gameState.ranOutOfTimeScreen} gameState={this.state.gameState} />

                        <AdminCantPlay Show={this.state.AdminCantPlay} />

                    </div>

                </div>
            );
        } else {
            return (
                <div>
                    <Connecting />

                </div>
            );
        }
    }
}