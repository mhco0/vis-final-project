import { loadSteamDataset } from "./datasetControl.js";

const svgWidth = 720;
const svgHeight = 480;

let steamDataset = await loadSteamDataset();

console.log(steamDataset);

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//