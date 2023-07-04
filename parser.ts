import * as fs from 'fs';
import * as readline from 'readline';
import { Games } from './gameFinder';

export type PlayerStats = {
    name: string
    goals: number,
    shots: number,
    hits: number,
    takeaways: number,
    interceptions: number,
    blocks: number,
    faceoffWins: number
}

const actions: string[] = [" takes a shot... and scores!", " takes a shot", " hits ", " takes the puck!", " intercepted by ", " blocks the shot", " wins the faceoff!"]; //list of possible events to be parsed for
const seasonStats: PlayerStats[] = [{name: 'Player Playerton', goals: 0, shots: 0, hits: 0, takeaways: 0, interceptions: 0, blocks: 0, faceoffWins: 0}]; //where all the player records go
let gamesParsed: number = 0;

/** Gathers data from the game log and then passes it to processInput.
 * @param gamePath - path to the game log
 */
function readGame(gamePath: string): void { //requires processInput, seasonStats, gamesParsed, actions
    const rs = fs.createReadStream(gamePath, 'utf-8');
    rs.on("data", (chunk) => {});
    const rl = readline.createInterface(rs);
    rl.on("line", (input) => {
        const eventCodes: number[] = [];
        for (let i = 0; i < 7; i++) {
            if (input.indexOf(actions[i]) != -1) eventCodes.push(i);
        }
        //console.log(input);
        //console.log(eventCodes);
        if (eventCodes.length != 0) processInput(input, eventCodes);
    });
    rl.on("close", () => {
        gamesParsed++;
        if (gamesParsed == 1140) {
            const output = JSON.stringify(seasonStats.filter((value) => value.name != 'Player Playerton').sort((a, b) => a.name > b.name ? 1 : -1));
            /*fs.writeFile('season1.json', output, 'utf-8', (err) => {
                if (err) throw err;
            })*/
            console.log(output);
        }
    });
}

/** Processes the input, determining the name of the player to credit with the event
 * @param input - The game event
 * @param eventCodes - Things that happened during the game event
 */
function processInput(input: string, eventCodes: number[]): void { //requires addPlayerRecord, incrementPlayerStat
    const inputWords: string[] = input.split(' ');
    if (eventCodes[0] == 4) {
        const playerName4 = inputWords.at(-2) + ' ' + inputWords.at(-1).substring(0, inputWords.at(-1).length - 1);
        //console.log(playerName4);
        addPlayerRecord(playerName4);
        incrementPlayerStat(playerName4, 3); //interception is also a takeaway
        incrementPlayerStat(playerName4, 4); //special case needed: non-standard name placeme
    }
    else if (eventCodes[0] == 1 && eventCodes[1] == 5) {
        const shooterName15 = inputWords[0] + ' ' + inputWords[1];
        const blockerIndex15 = inputWords.indexOf('shot...') + 1;
        const blockerName15 = inputWords[blockerIndex15] + ' ' + inputWords[blockerIndex15 + 1];
        //console.log(shooterName15);
        //console.log(blockerName15);
        addPlayerRecord(shooterName15);
        incrementPlayerStat(shooterName15, 1);
        addPlayerRecord(blockerName15);
        incrementPlayerStat(blockerName15, 5); //special case needed: two players
    }
    else if (eventCodes[0] == 1 && eventCodes[1] == 3) {
        const shooterName135 = inputWords[0] + ' ' + inputWords[1];
        const blockerIndex135 = inputWords.indexOf('shot...') + 1;
        const blockerName135 = inputWords[blockerIndex135] + ' ' + inputWords[blockerIndex135 + 1];
        //console.log(shooterName135);
        //console.log(blockerName135);
        addPlayerRecord(shooterName135);
        incrementPlayerStat(shooterName135, 1);
        addPlayerRecord(blockerName135);
        incrementPlayerStat(blockerName135, 3);
        incrementPlayerStat(blockerName135, 5); //special case needed: two players
    }
    else {
        const playerName = inputWords[0] + ' ' + inputWords[1];
        //console.log(playerName);
        addPlayerRecord(playerName);
        for (let code of eventCodes) {
           incrementPlayerStat(playerName, code);
        }
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
        faceoffWins: 0
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
            break; //I'm so sorry
    }
}

async function getSeasonStats() {
    fs.readFile('season1games.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        const parsedData: Games = JSON.parse(data);
        for (let game of Object.values(parsedData)) readGame(game.path + '/log.txt');
    });
}

getSeasonStats();