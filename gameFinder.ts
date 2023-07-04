import * as fs from 'fs/promises';

export type GameInfo = {
    path: string,
    day: number,
    round: number,
    awayTeam: string,
    homeTeam: string
};

export type Games = {
    [key: string]: GameInfo
};

/**
 * Parses a season of Hlockey and constructs a games object.
 * @returns the games object inside a promise.
 */
export async function constructGames(): Promise<Games> {
    let games: Games = {};
    let basePath: string;
    for (let i = 1; i <= 38; i++) {
        for (let j = 1; j <= 3; j++) {
            basePath = `../Downloads/hlockeyarchive3/Season 2/Day ${i < 10 ? ('0' + i.toString()) : i.toString()}/Round ${j.toString()}`;
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
                games[gameAddress] = {
                    path: basePath + '/' + game,
                    day: i,
                    round: j,
                    awayTeam: game.substring(0, game.indexOf('vs') - 1),
                    homeTeam: game.substring(game.indexOf('vs') + 3)
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
    const games: Games = await constructGames();
    console.log(games['d1r1g1']);
}
/**
 * Writes the result of constructGames to a JSON file
 */
async function writer(): Promise<void> {
    fs.writeFile('json/season2games.json', JSON.stringify(await constructGames()), 'utf-8');
}

writer();