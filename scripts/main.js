import { loadSteamDataset, getPriceHistory, getPlayerCount, PlayerCountHistoryPathType } from "./datasetControl.js";
import { Calendar } from "./thirdparty/Calendar.js";
import { buildLineGraph, LineGraph } from "./graphics.js"
import { calendarCluster } from "./calendarCluster.js";
import { kmeans } from "./thirdparty/Kmeans.js";

let steamDataset = await loadSteamDataset();

//console.log(steamDataset);
/*
for(let i = 0; i < 10; i++){
    console.log(await getPriceHistory(steamDataset[i]["id"]));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.f2f));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.h2h));
}*/

let csPriceHistory = await getPlayerCount(steamDataset[1]["id"], PlayerCountHistoryPathType.h2h);

//buildLineGraph(csPriceHistory, "time", "player_count");
/*const calendar = Calendar(csPriceHistory,{
    x: d => d["time"],
    y: d => d["player_count"]
});*/


//console.log(calendar);

//d3.select("#line_graph_div").node().appendChild(calendar);

const findGameById = (data, id) => {
    return data.find(x => x["id"] === id);
};

const getGenres = (data) => {
    let uniqueGenre = [];
    data.forEach(element => {
        element["props"]["genres"].forEach(genre => uniqueGenre.push(genre));
    });

    uniqueGenre = [...new Set(uniqueGenre)];

    return uniqueGenre;
};

const getGamesByGenre = (data, genre) => {
    let games = [];

    data.forEach(element => {
        if (element["props"]["genres"].includes(genre)){
            games.push({
                "name": element["props"]["name"],
                "id": element["id"]
            });
        }
    });

    return games;
};

const adaptDataToKmeans = (data, xCol, yCol) => {
    let convertData = [];

    data.forEach(element => {
        convertData.push({
            x: element[xCol],
            y: element[yCol]
        })
    });

    return convertData;
};

const genres = getGenres(steamDataset);
genres.sort(function(a, b){return a.localeCompare(b);});

//console.log(getGamesByGenre(steamDataset, genres[5]));

d3.select("#genreBox")
    .selectAll('myOptions')
    .data(genres)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; });
    
    
d3.select("#genreBox")
    .on("change", function(d) {
        const selectedGenre = d3.select(this).property("value");

        const gamesByGenre = getGamesByGenre(steamDataset, selectedGenre);
        gamesByGenre.sort(function(a, b){return a["name"].localeCompare(b["name"]);});

        d3.select("#gameBox").html("");
        d3.select("#gameBox")
            .selectAll("myOptions")
            .data(gamesByGenre)
            .enter()
            .append("option")
            .text(function(d) { return d["name"];})
            .attr("value", function (d) { return d["id"];});

        d3.select("#gameBox")
            .on("change", async function(d) {
                const gameId = d3.select(this).property("value");
                
                let game = findGameById(steamDataset, gameId);

                console.log(game);
                // need to adapt here for the dataset type. Maybe this isn't suppost to be a user decision 
                let gamePlayerCount = await getPlayerCount(game["id"], PlayerCountHistoryPathType.f2f);

                console.log(gamePlayerCount.length > 0);

                const lineGraph = LineGraph(gamePlayerCount, {
                    x: "time",
                    y: "player_count"
                });

                const calendar = Calendar(gamePlayerCount, {
                    x: d => d["time"],
                    y: d => d["player_count"]
                })
                
                console.log(lineGraph);

                d3.select("#line_graph_div").node().innerHTML = '';
                d3.select("#line_graph_div").node().appendChild(lineGraph);

                d3.select("#calendar_graph_div").node().innerHTML = '';
                d3.select("#calendar_graph_div").node().appendChild(calendar);
            });
    });

//let newData = adaptDataToKmeans(csPriceHistory, "time", "player_count");

//kmeans(newData, 10);

//console.log(calendarCluster(csPriceHistory, "time", "player_count", 150));

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//