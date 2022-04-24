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

export async function loadSteamDataset(){
    let steamDataset = {};
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