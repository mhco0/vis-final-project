import { loadSteamDataset, getPriceHistory, getPlayerCount, PlayerCountHistoryPathType } from "./datasetControl.js";
import { buildLineGraph } from "./graphs.js"

let steamDataset = await loadSteamDataset();

/*console.log(steamDataset);

for(let i = 0; i < 10; i++){
    console.log(await getPriceHistory(steamDataset[i]["id"]));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.f2f));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.h2h));
}*/

let csPriceHistory = await getPriceHistory(steamDataset[0]["id"]);

buildLineGraph(csPriceHistory);

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//