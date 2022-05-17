import { loadSteamDataset, getPriceHistory, getPlayerCount, PlayerCountHistoryPathType, loadGeoJson, getCorretPlayerCountPathById} from "./datasetControl.js";
import { Calendar } from "./thirdparty/Calendar.js";
import { buildLineGraph, LineGraph } from "./graphics.js"
import { calendarCluster } from "./calendarCluster.js";
import { kmeans } from "./thirdparty/Kmeans.js";
import { getGenres, getGamesByGenre, adaptDataToKmeans, findGameById, groupDataFromClusters, groupByDay } from "./utils.js";
import { Swatches } from "./thirdparty/Swatches.js";
import { MapGraph } from "./map.js";
import { Legend } from "./thirdparty/Legend.js";

let steamDataset = await loadSteamDataset();
let geoJson = await loadGeoJson();

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

const convertDateToPyTrends = (date) => {
    let convertedDate = new Date(Date.parse(date));

    console.log(convertedDate.toString());

    let convertedString = "";

    convertedString = convertedDate.getUTCFullYear() + "-" + (convertedDate.getUTCMonth() + 1) + "-" + convertedDate.getUTCDate();

    return convertedString + " " + convertedString;
}

const processLoading = () => {
    d3.select("#loading")
        .attr("class", "loading")
        .append("img")
        .attr("src", "../assets/ajax-loader.gif")
        .attr("alt", "Loading...");
}

const finishLoading = () => {
    d3.select("#loading").attr("class", "").node().innerHTML = '';
}

const genres = getGenres(steamDataset);
genres.sort(function(a, b){return a.localeCompare(b);});

let K = Number(d3.select("#clusterRange").attr("value")) - 1;
//console.log(K);

d3.select("#clusterRange")
    .on("input", function() {
        K = Number(this.value) - 1;
    });
  

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

        d3.select("#gameBox").html("").style("opacity", 1);
        d3.select("#gameBox")
            .append("option")
            .text("Select your game")
            .attr("value", "")
            .property("disabled", true);

        d3.select("#gameBox")
            .selectAll("myOptions")
            .data(gamesByGenre)
            .enter()
            .append("option")
            .text(function(d) { return d["name"];})
            .attr("value", function (d) { return d["id"];});

        d3.select("#gameBox")
            .on("change", async function(d) {
                console.log("loading...");
                d3.select("#loading")
                .attr("class", "loading")
                .append("img")
                .attr("src", "../assets/ajax-loader.gif")
                .attr("alt", "Loading...");

                d3.select("#map_graph_div").node().innerHTML = '';
                d3.select("#line_graph_div").node().innerHTML = '';
                d3.select("#calendar_graph_div").node().innerHTML = '';
                d3.select("#swatches_div").node().innerHTML = '';

                const gameId = d3.select(this).property("value");

                let game = findGameById(steamDataset, gameId);

                // need to adapt here for the dataset type. Maybe this isn't suppost to be a user decision 
                let gamePath = await getCorretPlayerCountPathById(game["id"]);
                let gamePlayerCount = await getPlayerCount(game["id"], gamePath);

                const gameName = game["props"]["name"];
                const mapGraph = await MapGraph(geoJson, gameName);
                d3.select("#map_graph_div").node().appendChild(mapGraph);
                d3.select("#map_graph_div")
                    .append("div")
                    .node()
                    .appendChild(Legend(d3.scaleThreshold([5, 10, 15, 20, 30, 45, 60, 75, 100], d3.schemeBlues[9]), {
                        title: "Interest"
                    }));
                
                if(gamePlayerCount.length > 0){
                    let convertedData = groupByDay(gamePlayerCount, "time", "player_count");//adaptDataToKmeans(gamePlayerCount, "time", "player_count");
    
                    kmeans(convertedData, K);
    
                    //console.log(convertedData);

                    const calendar = Calendar(convertedData, {
                        x: d => {
                            var dateParts = d["day"].split("/");

                            // month is 0-based, that's why we need dataParts[1] - 1
                            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 

                            return dateObject;
                        },
                        y: d => d["cluster"],
                        colors: d3.schemeTableau10,
                        clusterNumber: K
                    });
    
                    let clusteringData = groupDataFromClusters(convertedData, "x", "y", "cluster");
    
                    //console.log(clusteringData);

                    const lineGraph = LineGraph(clusteringData, {
                        x: "x",
                        y: "y",
                        clusterNumber: K
                    });
                    //console.log(lineGraph);
                    
                    d3.select("#line_graph_div")
                    .append("h3")
                    .text("Player Count by Hour")
                    .style("text-align", "center")
                    .style("margin-right", "80");

                    d3.select("#line_graph_div").node().appendChild(lineGraph);
                    d3.select("#calendar_graph_div").node().appendChild(calendar);

                    d3.select("#calendar_graph_div").selectAll("rect").on("click", async function(d){
                        processLoading();
                        let date = d3.select(this).attr("value");

                        let converted = convertDateToPyTrends(date);

                        //console.log(converted);

                        d3.select("#map_graph_div").node().innerHTML = '';

                        const mapGraph = await MapGraph(geoJson, gameName, { dateRange : converted});
                        d3.select("#map_graph_div").node().appendChild(mapGraph);
                        d3.select("#map_graph_div")
                            .append("div")
                            .node()
                            .appendChild(Legend(d3.scaleThreshold([5, 10, 15, 20, 30, 45, 60, 75, 100], d3.schemeBlues[9]), {
                                title: "Interest"
                            }));

                        finishLoading();
                    })

                    //console.log([...Array(K + 1).keys()]);
                    d3.select("#swatches_div").node().appendChild(Swatches(d3.scaleOrdinal([...Array(K + 1).keys()].map((cluster) => "cluster " + String(cluster)), d3.schemeTableau10)));
                }

                d3.select("#loading").attr("class", "").node().innerHTML = '';
            });
    });

//let newData = adaptDataToKmeans(csPriceHistory, "time", "player_count");

//kmeans(newData, 10);

//console.log(calendarCluster(csPriceHistory, "time", "player_count", 150));

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//