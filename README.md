# Pluck

Pluck is a parser and stat compiler for [Hlockey](https://hlockey.onrender.com/), a hockey simulator by Lavender. It is written in TypeScript.

## What does each part do?

* gameFinder.ts - find all games in a season and write them to a JSON file/logs an example game.
* parser.ts - reads games, parses events, and writes a database of player stats to a JSON file.
* getPlayerData.ts - reads team files and writes a database of player teams, positions, and attributes to a JSON file.
* joinStats.ts - joins the results from parser and getPlayerData and writes the result to a JSON file.
* query.ts - allows you to query the JSON database.

## What am I planning to do with this?

This can be found in todo.md!