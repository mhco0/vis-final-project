// getting data https://data.mendeley.com/datasets/ycy3sy3vj2/1
const dataPath = "../data/SteamDataset/";
const playerCountPath1 = dataPath + "PlayerCountHistoryPart1/"; // data from top 1000 get from 5 to 5 minutes
const playerCountPath2 = dataPath + "PlayerCountHistoryPart2/"; // data from the next top 1000 get from 20 to 20 minutes
const priceHistoryPath = dataPath + "PriceHistory/";

const steamDevelopersFilename = dataPath + "applicationDevelopers.csv";
const steamGenreFilename = dataPath + "applicationGenres.csv";
const steamInfoFilename = dataPath + "applicationInformation.csv";
const steamPackageFilename = dataPath + "applicationPackages.csv";
const steamPublishersFilename = dataPath + "applicationPublishers.csv";
const steamSupportedLanguagesFilename = dataPath + "applicationSupportedlanguages.csv";
const steamTagsFilename = dataPath + "applicationTags.csv";

/**
 * Private function. Check if some file exists using CommonJs standard
 * @param {string} url - The path for the file.
 * @returns {boolean} - True if the file exists, false otherwise.
*/
async function fileExists(url){
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    try{
        http.send();
    } catch(error) {
        console.log(error);
    }

    return http.status != 404;
}

/**
 * Private function. Adds some properts in the object from @p data array using the @p filename as base. Adds the propertys in the field @p prop.
 * @param {array} data - The input array of object
 * @param {string} filename - The filename to fetch the data.
 * @param {string} prop - The property of the object to be expanded.
*/
function addPropsFromCsv(data, filename, prop){
    d3.text(filename).then((text) => {
        let rows = d3.csvParseRows(text);
        for(let i = 0; i < rows.length; i++){
            if (rows[i].length <= 1){
                continue;
            }

            let id = rows[i][0];
            
            data.find((obj, index) => {
                if (obj["id"] === id){
                    for(let j = 1; j < rows[i].length; j++){
                        data[index]["props"][prop].push(rows[i][j]);
                    }
                    
                    return true;
                }
            });
        }
    });
}

/**
 * Loads the SteamDataset.
 * @returns {array} - The steam dataset as a array of objets.
*/
export async function loadSteamDataset(){
    let steamDataset = [];
    /// Processing all datasets
    await d3.csv(steamInfoFilename, function(line){
        return {
            "id": line["appid"],
            "props": {
                "type": line["type"],
                "name": line["name"],
                "release_date": line["releasedate"],
                "free_to_play": (line["freetoplay"] === "1"),
                "developers": [],
                "genres": [],
                "packages": [],
                "publisers": [],
                "languages": [],
                "tags": []
            }
        };
    }).then((data) => {
        data.sort((a, b) => a["id"] - b["id"]);

        addPropsFromCsv(data, steamDevelopersFilename, "developers");
        addPropsFromCsv(data, steamGenreFilename, "genres");
        addPropsFromCsv(data, steamPackageFilename, "packages");
        addPropsFromCsv(data, steamPublishersFilename, "publisers");
        addPropsFromCsv(data, steamSupportedLanguagesFilename, "languages");
        addPropsFromCsv(data, steamTagsFilename, "tags");

        steamDataset = data;
    });

    return steamDataset;
}

/// This variables contains the paths for the players count history
export const PlayerCountHistoryPathType = {
    f2f: playerCountPath1,
    t2t: playerCountPath2
}

/**
 * This function gets the player count history for some @p id. This function fetchs the id based on the @p path parameter.
 * @param {number} id - The application id from the StreamDataset.
 * @param {string} path - The path for fetch the file. You can use PlayerCountHistoryPathType.f2f to fetch in the path with 5 minutes delay or PlayerCountHistoryPathType.
 * @returns {array} A array of objects with the player count history or a empty array if the file was not found.
*/
export async function getPlayerCount(id, path){
    let playerCount = [];
    let filename = path + "" + id + ".csv";

    let exists = await fileExists(filename);
    if (!exists) return playerCount;

    await d3.csv(filename, function(line){
        return {
            "time": line["Time"],
            "player_count": line["Playercount"]
        };
    }).then((data) =>{
        playerCount = data;
    });

    return playerCount;
}

/**
 * This function gets the price history for some @p id.
 * @param {number} id - The application id from the StreamDataset.
 * @returns {array} A array of objects with the price history or a empty array if the file was not found.
*/
export async function getPriceHistory(id){
    let priceHistory = [];
    let filename = priceHistoryPath + "" + id + ".csv";

    let exists = await fileExists(filename);
    if (!exists) return priceHistory;

    await d3.csv(filename, function(line){
        return {
            "date": line["Date"],
            "initial_price": line["Initialprice"],
            "final_price": line["Finalprice"],
            "discount": line["Discount"]
        };
    }).then((data) =>{
        priceHistory = data;
    });

    return priceHistory;
}