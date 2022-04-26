
function getDaysPatterns(dataset, xCollumn){
    let mapDateToClusterId = {};
    let clusters = {};
    let clusterId = 0;

    dataset.forEach(element => {
        const dayString = "" + element[xCollumn].getDay() + "-" + element[xCollumn].getMonth() + "-" + element[xCollumn].getFullYear();
        
        if (dayString in mapDateToClusterId){
            clusters[mapDateToClusterId[dayString]].push(element);
        }else{
            mapDateToClusterId[dayString] = clusterId;
            clusters[mapDateToClusterId[dayString]] = [];
            
            clusterId++;
        }
    });

    return {
        "clusters": clusters,
        "date_to_cluster_map": mapDateToClusterId,
        "M": clusterId
    };
}

function calculateDistanceFrom(clusterA, clusterB, xCollumn, yCollumn){
    let aSize = clusterA.length;
    let bSize = clusterB.length;

    if (aSize == 0 || bSize == 0) return -1;

    let distanceRms = 0;

    for(let i = 0; i < aSize; i++){
        for(let j = 0; j < bSize; j++){
            const xDistance = (clusterA[i][xCollumn].getTime() - clusterB[j][xCollumn].getTime());
            const yDistance = (clusterA[i][yCollumn] - clusterB[j][yCollumn]);
            const partialDistance = (xDistance * xDistance) + (yDistance * yDistance); // deltaX^2 + deltaY^2

            distanceRms += partialDistance;
        }
    }

    
    distanceRms = Math.sqrt(distanceRms);
    distanceRms = distanceRms / ((aSize) * (bSize)); // Normalize
    
    return distanceRms;
}

/*
1) Start by assigning each item to a cluster, so that if there are n items, we will have
n clusters, each cluster containing only one item.
2) Find the closest (most similar) pair of clusters and merge them into a single cluster,
so now we have one cluster less.
3) Compute distances (similarities) between the new cluster and of the old clusters.
4) Repeat steps 2) and 3) until all items are clustered into a single cluster or size n
*/
export function calendarCluster(dataset, xCollumn, yCollumn, mGroups){
    // split the dataset in a sequence of day patterns
    let daysPatterns = getDaysPatterns(dataset, xCollumn);
    //console.log(daysPatterns);
    let clusters = daysPatterns["clusters"];
    let dateToClusterMap = daysPatterns["date_to_cluster_map"];
    const M = daysPatterns["M"];
    let currentGroupsCount = M;
    let clusterParents = {};
    let ativeClusters = [];

    for(let i = 0; i < M; i++){
        clusterParents[i] = i;
        ativeClusters.push(i);
    }

    //console.log("meme");

    let ativeClustersCount = ativeClusters.length;
    /*console.log(ativeClustersCount);
    console.log(ativeClustersCount > mGroups);
    console.log(currentGroupsCount < ((2 * M) - 1));*/

    while( ativeClustersCount > mGroups && currentGroupsCount < ((2 * M) - 1)){
        let minDistance = Number.MAX_VALUE;
        let clustersToMergeLhs = -1;
        let clustersToMergeRhs = -1;
        // get all distances for active clusters

        //console.log("before");
        for(let i = 0; i < ativeClustersCount; i++){
            //console.log("i: ", i);
            for(let j = 0; j < i; j++){
                const clusterA = ativeClusters[i];
                const clusterB = ativeClusters[j];
                const distanceRms = calculateDistanceFrom(clusters[clusterA], clusters[clusterB], xCollumn, yCollumn);
                //console.log("drms: ", distanceRms, " md: ", minDistance);

                if (distanceRms == -1) continue;

                if (distanceRms < minDistance){
                    minDistance = distanceRms;
                    clustersToMergeLhs = clusterA;
                    clustersToMergeRhs = clusterB;
                }

               // console.log("j: ", j, " ", distanceRms < minDistance);
            }
        }
        //console.log("after");

        //console.log("?");

        if(clustersToMergeLhs == -1 && clustersToMergeRhs == -1){
            break;
        }

        // merge and remove ative clusters

        //console.log("here");
        currentGroupsCount++;

        clusterParents[clustersToMergeLhs] = currentGroupsCount;
        clusterParents[clustersToMergeRhs] = currentGroupsCount;
        clusterParents[currentGroupsCount] = currentGroupsCount;

        ativeClusters.push(currentGroupsCount);

        //delete ativeClusters[clustersToMergeLhs];
        //delete ativeClusters[clustersToMergeRhs];

        let leftIndex = ativeClusters.indexOf(clustersToMergeLhs);
        if (leftIndex > -1) {
            ativeClusters.splice(leftIndex, 1);
        }

        let rightIndex = ativeClusters.indexOf(clustersToMergeRhs);
        if (rightIndex > -1) {
            ativeClusters.splice(rightIndex, 1);
        }
        
        ativeClustersCount = ativeClusters.length;
        //console.log(ativeClustersCount);

        clusters[currentGroupsCount] = [];

        clusters[clustersToMergeLhs].forEach(element => {
            clusters[currentGroupsCount].push(element);
        });

        clusters[clustersToMergeRhs].forEach(element => {
            clusters[currentGroupsCount].push(element);
        });
    }

    return {
        "clusters": clusters,
        "clusters_parrents": clusterParents,
        "top_clusters": ativeClusters,
        "date_to_cluster_map": dateToClusterMap
    };
}