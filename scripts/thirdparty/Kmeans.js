//import _ from 'lodash.js';

export const kmeans = (d, K, transformation) => {
    transformation = transformation || ((x) => [x.x,x.y]);
    var allocation = _.map (d, (e) => _.random (K));
    var centroids  = _.map (_.range (K), (d) => []);

    var done = false;
    var it = 0;
    while (!done && it < 10000) {
        // compute centroids 
        for (var cluster = 0; cluster < K; cluster++) {
            var total = 0;
            // save previous value of the centroid in case the cluster is empty
            var prev = centroids[cluster];
            centroids[cluster] = _.map (_.reduce (_.filter (d, (d,i) => allocation[i] == cluster), (mean, element) => {
                total ++;
                if (total == 1) {
                    mean = transformation (element);
                } else {
                    var e = transformation (element);
                    mean = _.map (mean, (c,k) => c + e[k]);
                }
                return mean;
            }), (ct) => ct/total);
        
            if ( centroids[cluster].length == 0) {
            centroids[cluster] = prev;
            }
        }
            done = true;
            _.each (d, (point,i) => 
                    {
                        const pt          = transformation (point);
                        var best_d        = 1e100,
                            best_cluster  = allocation[i];

                        for (var cluster = 0; cluster < K; cluster++) {
                            //console.log (centroids[cluster], pt);
                            var d = Math.sqrt(_.reduce (centroids[cluster], (d,cp,idx) => {
                            return d + (cp - pt[idx])*(cp - pt[idx]);
                            }, 0));
                        
                            if (d < best_d) {
                            best_cluster = cluster;
                            best_d = d;
                            }
                        }

                        if (best_cluster !=  allocation[i]) {
                        allocation[i] = best_cluster;
                        done = false;
                        }
                    }
                );
        it++;
    }
    _.each (d, (point, i) => {point.cluster = allocation[i]});
};