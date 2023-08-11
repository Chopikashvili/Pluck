import * as fs from 'fs/promises';
import { Games } from './gameFinder';

async function gameQuery(season: number, key: string, value: string): Promise<void> {
    let result: any[] = [];
    const data: string = await fs.readFile(`json/season${season.toString()}games.json`, 'utf-8');
    const parsedData: Games = JSON.parse(data); //parses JSON
    if (typeof parsedData['d1r1g1'][key] == undefined) console.log('No such stat.');
    else {
        for (let game of Object.values(parsedData)) {
            if (game[key] == value) result.push(game);
        }
        console.log(result);
    }
}

gameQuery(4, 'weather', 'Audacity');