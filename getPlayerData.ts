import * as fs from 'fs/promises';

export type PlayerData = {
    name: string,
    team: string,
    position: string
    offense: number,
    defense: number,
    agility: number
}

const positions: string[] = ['LW', 'C', 'RW', 'LD', 'G', 'RD']

/**
 * Looks at the team files in the season directory, makes a database of player data in the Division directory, and writes it to a JSON file.
 * @param season - the season number
 */
async function getPlayerData(season: number): Promise<void> {
    const players: PlayerData[] = [];
    let playersParsed: number = 0; //counts how many players are parsed
    for (let division of ['Dry Cool', 'Dry Warm', 'Wet Cool', 'Wet Warm']) {
        const path = `../Downloads/hlockeyarchive3/Season ${season.toString()}/Divisions/${division}`;
        const files = await fs.readdir(path) //list of teams
        for (let team of files) {
            const data = await fs.readFile(path + '/' + team, 'utf-8'); //data of each team
            const splitData = data.split('\n');
            for (let i = 1; i < splitData.length - 1; i += 4) {
                players.push({
                    name: splitData[i].substring(splitData[i].indexOf(':') + 2),
                    team: team.substring(0, team.indexOf('.')),
                    position: positions[(i / 4 - (i % 4) / 4)],
                    offense: Number.parseFloat(splitData[i + 1].substring(splitData[i + 1].indexOf(':') + 2)),
                    defense: Number.parseFloat(splitData[i + 2].substring(splitData[i + 2].indexOf(':') + 2)),
                    agility: Number.parseFloat(splitData[i + 3].substring(splitData[i + 3].indexOf(':') + 2))
                });
                playersParsed++;
                if (playersParsed == 120) await fs.writeFile(`json/season${season.toString()}teams.json`, JSON.stringify(players), 'utf-8');
            }
        }
    }
}

getPlayerData(2);