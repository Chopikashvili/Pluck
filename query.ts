import * as fs from 'fs/promises';
import { PlayerStats } from './parser';
import { PlayerJoined } from './joinStats';

async function query(season: number, stat: string, limit?: number, asc?: boolean): Promise<void> {
    let result: any[] = [];
    const parsedData: PlayerStats[] = JSON.parse(await fs.readFile(`json/season${season.toString()}.json`, 'utf-8')); //parses JSON
    if (typeof parsedData[0][stat] == undefined) console.log('No such stat.');
    else {
        result = parsedData.sort((a, b) => asc ? (a[stat] - b[stat]) : -(a[stat] - b[stat])).slice(0, limit); //makes query
        console.log(result);
    }
}

async function queryJoined(season: number, stat: string, limit?: number, asc?: boolean): Promise<void> {
    let result: any[] = [];
    const parsedData: PlayerJoined[] = JSON.parse(await fs.readFile(`json/season${season.toString()}joined.json`, 'utf-8')); //parses JSON
    if (typeof parsedData[0][stat] == undefined) console.log('No such stat.');
    else {
        result = parsedData.sort((a, b) => asc ? (a[stat] - b[stat]) : -(a[stat] - b[stat])).slice(0, limit); //makes query
        console.log(result);
    }
}

queryJoined(1, 'shootingPct', 30, true);