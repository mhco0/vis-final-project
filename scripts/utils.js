
export const groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

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

export const findGameById = (data, id) => {
    return data.find(x => x["id"] === id);
};

export const getGenres = (data) => {
    let uniqueGenre = [];
    data.forEach(element => {
        element["props"]["genres"].forEach(genre => uniqueGenre.push(genre));
    });

    uniqueGenre = [...new Set(uniqueGenre)];

    return uniqueGenre;
};

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