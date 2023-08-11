import * as fs from 'fs/promises';

export type GameInfo = {
    path: string,
    day: number,
    round: number,
    awayTeam: string,
    homeTeam: string,
    weather: string | null
};

export type Games = {
    [key: string]: GameInfo
};

/**
 * Parses a season of Hlockey and constructs a games object.
 * @param season The season number.
 * @returns the games object inside a promise.
 */
export async function constructGames(season: number): Promise<Games> {
    let games: Games = {};
    let basePath: string;
    for (let i = 1; i <= 38; i++) {
        for (let j = 1; j <= 3; j++) {
            basePath = `../Downloads/hlockeyarchive4/Season ${season.toString()}/Day ${i < 10 ? ('0' + i.toString()) : i.toString()}/Round ${j.toString()}`;
            let files: string[];
            try {
                files = await fs.readdir(basePath); //reads every game from the round
            }
            catch (err) {
                console.error(err);
            }
            let k = 0;
            for (let game of files) {
                let gameAddress = `d${i.toString()}r${j.toString()}g${(k + 1).toString()}`;
                let info = await fs.readFile(basePath + '/' + game + '/info.txt', 'utf-8');
                games[gameAddress] = {
                    path: basePath + '/' + game,
                    day: i,
                    round: j,
                    awayTeam: game.substring(0, game.indexOf('vs') - 1),
                    homeTeam: game.substring(game.indexOf('vs') + 3),
                    weather: season >= 3 ? info.substring(info.lastIndexOf(':') + 2, info.length - 1) : null
                }; //adds info about games to the games object
                k++;
            }
        }
    }
    return games;
}
/**
 * Logs the first game of constructGames
 */
async function logger(): Promise<void> {
    const games: Games = await constructGames(4);
    console.log(games['d1r1g1']);
}
/**
 * Writes the result of constructGames to a JSON file
 */
async function writer(): Promise<void> {
    fs.writeFile('json/season4games.json', JSON.stringify(await constructGames(4)));
}

writer();