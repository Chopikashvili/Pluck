import * as fs from 'fs/promises';
import { PlayerStats } from './parser';
import { PlayerData } from './getPlayerData';

export type PlayerJoined = {
    name: string,
    team: string,
    position: string,
    goals: number,
    shots: number,
    shootingPct: number,
    hits: number,
    takeaways: number,
    interceptions: number,
    blocks: number,
    faceoffWins: number
}

/** Joins PlayerStats and PlayerData objects on name and returns the array of joined objects
 * @param jsonStats - the serialized representation of the PlayerStats object array
 * @param jsonData - the serialized representation of the PlayerData object array
 */
function joinStats(jsonStats: string, jsonData: string): string {
    const parsedStats: PlayerStats[] = JSON.parse(jsonStats);
    const parsedData: PlayerData[] = JSON.parse(jsonData);
    let deserJoined: PlayerJoined[] = [];
    for (let valueStats of parsedStats) {
        let valueData = parsedData.find((value) => value.name == valueStats.name);
        if (typeof valueData == undefined) {
            console.error('Unmatched player');
            return '';
        } //failsafe for if the name is incorrect
        else deserJoined.push({
            name: valueData.name,
            team: valueData.team,
            position: valueData.position,
            goals: valueStats.goals,
            shots: valueStats.shots,
            shootingPct: valueStats.goals / valueStats.shots,
            hits: valueStats.hits,
            takeaways: valueStats.takeaways,
            interceptions: valueStats.interceptions,
            blocks: valueStats.blocks,
            faceoffWins: valueStats.faceoffWins
        });
    }
    return JSON.stringify(deserJoined);
}

/** Calls joinStats on data for a specific season
 * @param season - season number
 */
async function joiner(season: number): Promise<void> {
    const season1: string = await fs.readFile(`json/season${season.toString()}.json`, 'utf-8');
    const season1teams: string = await fs.readFile(`json/season${season.toString()}teams.json`, 'utf-8');
    await fs.writeFile(`json/season${season}joined.json`, joinStats(season1, season1teams), 'utf-8');
}

joiner(2);