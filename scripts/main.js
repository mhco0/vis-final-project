import { loadSteamDataset, getPriceHistory, getPlayerCount, PlayerCountHistoryPathType } from "./datasetControl.js";

const svgWidth = 720;
const svgHeight = 480;

let steamDataset = await loadSteamDataset();

console.log(steamDataset);

for(let i = 0; i < 10; i++){
    console.log(await getPriceHistory(steamDataset[i]["id"]));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.f2f));
    console.log(await getPlayerCount(steamDataset[i]["id"], PlayerCountHistoryPathType.t2t));
}

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//