import { loadSteamDataset, getPriceHistory, getPlayerCount, PlayerCountHistoryPathType } from "./datasetControl.js";
import { Calendar } from "./thirdparty/Calendar.js";
import { buildLineGraph } from "./graphics.js"
import { calendarCluster } from "./calendarCluster.js";

let steamDataset = await loadSteamDataset();

/*console.log(steamDataset);

for(let i = 0; i < 10; i++){
    console.log(await getPriceHistory(steamDataset[i]["id"]));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.f2f));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.h2h));
}*/

let csPriceHistory = await getPlayerCount(steamDataset[1]["id"], PlayerCountHistoryPathType.h2h);

//buildLineGraph(csPriceHistory, "time", "player_count");
const calendar = Calendar(csPriceHistory,{
    x: d => d["time"],
    y: d => d["player_count"]
});


console.log(calendar);

d3.select("#line_graph_div").node().appendChild(calendar);

console.log("before");
//console.log(calendarCluster(csPriceHistory, "time", "player_count", 150));

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//