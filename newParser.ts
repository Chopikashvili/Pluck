import * as fs from 'fs';
import * as readline from 'readline';
import { Games, GameInfo } from './gameFinder';
import { PlayerData } from './getPlayerData';

export type PlayerStats = {
    name: string
    goals: number,
    shots: number,
    hits: number,
    takeaways: number,
    interceptions: number,
    blocks: number,
    faceoffWins: number,
    faceoffLosses: number,
    goalsAllowed: number,
    shotsFaced: number
}

let teamInfo: PlayerData[] = [];
const seasonStats: PlayerStats[] = []; //where all the player records go

/** Gathers data from the game log and then passes it to processInput.
 * @param gamePath - path to the game log
 */
function readGame(game: GameInfo): void { //requires processInput, seasonStats, gamesParsed, actions
    const actions: string[] = [" takes a shot and scores!", " takes a shot", " hits ", " takes the puck!", "Intercepted by ", " blocks the shot", " wins the faceoff!"]; //list of possible events to be parsed for
    const changes: string[] = [" washed away ", "chickened out!", "rest of the season", "rest of the game"]
    let gamesParsed: number = 0;
    const rs = fs.createReadStream(game.path + '/log.txt', 'utf-8');
    rs.on("data", (chunk) => {});
    const rl = readline.createInterface(rs);
    rl.on("line", (input) => {
        const eventCodes: number[] = [];
        const changeCodes: number[] = [];
        for (let i = 0; i < 7; i++) {
            if (input.indexOf(actions[i]) != -1) eventCodes.push(i);
        }
        for (let i = 0; i < 4; i++) {
            if (input.indexOf(changes[i]) != -1) changeCodes.push(i);
        }
        //console.log(input);
        //console.log(eventCodes);
        if (eventCodes.length != 0) processInput(input, eventCodes, changeCodes, game);
    });
    rl.on("close", () => {
        gamesParsed++;
        if (gamesParsed == 1140) {
            const output = JSON.stringify(seasonStats.sort((a, b) => a.name > b.name ? 1 : -1));
            fs.writeFile('json/season2.json', output, 'utf-8', (err) => {
                if (err) throw err;
            })
            //console.log(output);
        }
    });
}

/** Processes the input, determining the name of the player to credit with the event
 * @param input - The game event
 * @param eventCodes - Things that happened during the game event
 */
function processInput(input: string, eventCodes: number[], changeCodes: number[], game: GameInfo): void { //requires addPlayerRecord, incrementPlayerStat
    const inputWords: string[] = input.split(' ');
    if (eventCodes[0] == 4) {
        const playerName4 = inputWords.at(-2) + ' ' + inputWords.at(-1).substring(0, inputWords.at(-1).length - 1);
        //console.log(playerName4);
        addPlayerRecord(playerName4);
        incrementPlayerStat(playerName4, 3); //interception is also a takeaway
        incrementPlayerStat(playerName4, 4); //special case needed: non-standard name placement
    }
    else if (eventCodes.indexOf(1) != -1) {
        const shooterName1 = inputWords[0] + ' ' + inputWords[1];
        const shooterTeam1: string = teamInfo.find((value) => value.name == shooterName1).team;
        const goalieTeam1: string = getOppoTeam(shooterTeam1, game);
        const goalieName1 = teamInfo.find((value) => value.team == goalieTeam1 && value.position == 'G').name;
        addPlayerRecord(shooterName1);
        for (let code of eventCodes) {
           incrementPlayerStat(shooterName1, code);
        }
        addPlayerRecord(goalieName1);
        if (eventCodes.indexOf(0) != -1) incrementPlayerStat(goalieName1, 8);
        incrementPlayerStat(goalieName1, 9);
    }
    else if (eventCodes.indexOf(6) != -1) {
        const winningCenter6 = inputWords[0] + ' ' + inputWords[1];
        const winningCenterTeam6: string = teamInfo.find((value) => value.name == winningCenter6).team;
        const losingCenterTeam6: string = getOppoTeam(winningCenterTeam6, game);
        const losingCenter6 = teamInfo.find((value) => value.team == losingCenterTeam6 && value.position == 'C').name;
        addPlayerRecord(winningCenter6);
        incrementPlayerStat(winningCenter6, 6);
        addPlayerRecord(losingCenter6);
        incrementPlayerStat(losingCenter6, 7);
    }
    else {
        const playerName = inputWords[0] + ' ' + inputWords[1];
        //console.log(playerName);
        addPlayerRecord(playerName);
        for (let code of eventCodes) {
           incrementPlayerStat(playerName, code);
        }
    }
    if (changeCodes[0] == 2) {
        const playerName = inputWords[0] + ' ' + inputWords[1];
        addPlayerRecordToBeginning(playerName);
    }
}

/** Checks if a player is represented in seasonStats, and if they're not, adds a record.
 * @param playerName - name of the player.
 */
function addPlayerRecord(playerName: string): void { //requires seasonStats
    if (seasonStats.filter((value) => value.name == playerName).length == 0) seasonStats.push({
        name: playerName,
        goals: 0,
        shots: 0,
        hits: 0,
        takeaways: 0,
        interceptions: 0,
        blocks: 0,
        faceoffWins: 0,
        faceoffLosses: 0,
        goalsAllowed: 0,
        shotsFaced: 0
    });
}

function addPlayerRecordToBeginning(playerName: string): void { //requires seasonStats
    if (seasonStats.filter((value) => value.name == playerName).length == 0) seasonStats.unshift({
        name: playerName,
        goals: 0,
        shots: 0,
        hits: 0,
        takeaways: 0,
        interceptions: 0,
        blocks: 0,
        faceoffWins: 0,
        faceoffLosses: 0,
        goalsAllowed: 0,
        shotsFaced: 0
    });
}

/** Makes the necessary stat go up by one.
 * @param playerName - name of the player.
 * @param statCode - code for the stat.
 */
function incrementPlayerStat(playerName: string, statCode: number): void { //requires seasonStats
    const index: number = seasonStats.indexOf(seasonStats.find((value) => value.name == playerName));
    switch (statCode) {
        case 0:
            seasonStats[index].goals++;
            break;
        case 1:
            seasonStats[index].shots++;
            break;
        case 2:
            seasonStats[index].hits++;
            break;
        case 3:
            seasonStats[index].takeaways++;
            break;
        case 4:
            seasonStats[index].interceptions++;
            break;
        case 5:
            seasonStats[index].blocks++;
            break;
        case 6:
            seasonStats[index].faceoffWins++;
            break; 
        case 7: 
            seasonStats[index].faceoffLosses++;
            break;
        case 8:
            seasonStats[index].goalsAllowed++;
            break;
        case 9:
            seasonStats[index].shotsFaced++;
            break;//it got worse
    }
}

function getOppoTeam(team: string, game: GameInfo): string {
    return team == game.homeTeam ? game.awayTeam : game.homeTeam;
}

async function getSeasonStats() {
    fs.readFile('json/season2teams.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        teamInfo = JSON.parse(data);
        fs.readFile('json/season2games.json', 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            const parsedData: Games = JSON.parse(data);
            for (let game of Object.values(parsedData)) readGame(game);
        });
    });
}

getSeasonStats();