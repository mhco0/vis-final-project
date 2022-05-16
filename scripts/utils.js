
/**
 * This functions groups some array of objects @p xs by it's key @p key.
 * @param {array} xs A javascript array of objects.
 * @param {string} key A key to use as a group by operator.
 * @returns A new object with the values 
*/
export const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

/**
 * This function groups all data from cluster and merges it in a new data.
 * @param {array} data - A array of objects
 * @param {string} xCol - The key that is used as the x value in the kmeans
 * @param {string} yCol - The key that is used as the y value in the kmeans
 * @param {string} clusterCol - The key that is filled by the kmeans cluster
 * @return A new array of objects with all data grouped. 
*/
export const groupDataFromClusters = (data, xCol, yCol, clusterCol) => {
    let groupedByCluster = groupBy(data, clusterCol);
    let groupedData = {};

    for(const [cluster, points] of Object.entries(groupedByCluster)){
        
        groupedData[cluster] = [];

        let pointsByHours = points.map(d => { // this maybe change the original data
            let dx = d;
            dx[xCol] = dx[xCol].getHours();
            return dx;
        });

        let groupsByDate = groupBy(pointsByHours, xCol);

        for (const [hour, countsPerHour] of Object.entries(groupsByDate)){
            let sum = 0.0;
            for( let i = 0; i < countsPerHour.length; i++ ){
                sum += Number(countsPerHour[i][yCol]);
            }

            let avg = 0.0;
            if (countsPerHour.length !== 0){
                avg = sum / countsPerHour.length;
            }

            groupedData[cluster].push({x: hour, y: avg});
        }
    }

    return groupedData;
}

/**
 * This functions find some object with the key @p id in the array of objects @p data
 * @param {array} data - A array of objects 
 * @param {number} id - The id of the object searched.
 * @returns The object with the id queried.
*/
export const findGameById = (data, id) => {
    return data.find(x => x["id"] === id);
};

/**
 * This function get all genres in a array of object @p data and returns only the unique values.
 * @param {array} data - A array of objects 
 * @returns A list of string with all possible genres.
*/ 
export const getGenres = (data) => {
    let uniqueGenre = [];
    data.forEach(element => {
        element["props"]["genres"].forEach(genre => uniqueGenre.push(genre));
    });

    uniqueGenre = [...new Set(uniqueGenre)];

    return uniqueGenre;
};

/**
 * This function get all games from the SteamDataset @p data only if the game belongs to genre @p genre
 * @param {array} data - The SteamDataset as a array of objects.
 * @param {string} genre - Some string with the genre queried.
 * @returns A array of objects with the games that belongs to genre @p genre.
*/
export const getGamesByGenre = (data, genre) => {
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

/**
 * This function get all elements from @p data dataset and uses the key @p xCol and @p yCol to arrange the dataset for the kmeans function.
 * @param {array} data - A array of objects.
 * @param {string} xCol - The key in the array of objects to be used as the x value for the kmeans
 * @param {string} yCol -  The key in the array of objects to be used as the y value for the kmeans
 * @retuns The dataset with the values converted.s
*/
export const adaptDataToKmeans = (data, xCol, yCol) => {
    let convertData = [];

    data.forEach(element => {
        convertData.push({
            x: element[xCol],
            y: element[yCol]
        })
    });

    return convertData;
};