// getting data https://data.mendeley.com/datasets/ycy3sy3vj2/1
const dataPath = "../data/SteamDataset/";
const playerCountPath1 = dataPath + "PlayerCountHistoryPart1/"; // data from top 1000 get from 5 to 5 minutes
const playerCountPath2 = dataPath + "PlayerCountHistoryPart2/"; // data from the next top 1000 get from 20 to 20 minutes

const steamDevelopersFilename = dataPath + "applicationDevelopers.csv";
const steamGenreFilename = dataPath + "applicationGenres.csv";
const steamInfoFilename = dataPath + "applicationInformation.csv";
const steamPackageFilename = dataPath + "applicationPackages.csv";
const steamPublishersFilename = dataPath + "applicationPublishers.csv";
const steamSupportedLanguagesFilename = dataPath + "applicationSupportedlanguages.csv";
const steamTagsFilename = dataPath + "applicationTags.csv";

const svgWidth = 720;
const svgHeight = 480;

let steamDataset = {};

d3.csv(steamInfoFilename, function(line){
    return {
    };
});

//https://stackoverflow.com/questions/13870265/read-csv-tsv-with-no-header-line-in-d3 
//