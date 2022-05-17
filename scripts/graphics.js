import { PriceHistoryDomain, PlayerCountHistoryDomain } from "./datasetControl.js";

export function buildLineGraph(dataset, timeCollumn, valueCollumn){
    const margin = {top: 10, right: 30, bottom: 30, left: 60};
    const svgWidth = 720 - margin.left - margin.right;
    const svgHeight = 480 - margin.top - margin.bottom;

    const lineGraphId = "line_graph";
    const lineGraphViewGroupId = "line_graph_view_group";

    d3.select("#line_graph_div")
    .append("svg")
    .attr("id", lineGraphId)
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .append("g")
    .attr("id", lineGraphViewGroupId)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleTime()
                .domain([PlayerCountHistoryDomain.begin, PlayerCountHistoryDomain.end])
                .range([0, svgWidth]).nice();

    let yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return +d[valueCollumn];
                })])
                .range([svgHeight, 0]).nice();

    d3.select("#" + lineGraphViewGroupId)
        .append("g")
        .attr("transform", "translate(0, " + svgHeight + ")")
        .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(1))
                .tickFormat(d => d <= d3.timeMonth(d) ? d.getMonth() + 1 : null)
        );
        
    d3.select("#" + lineGraphViewGroupId)
        .append("g")
        .call(d3.axisLeft(yScale));

    d3.select("#" + lineGraphViewGroupId)
        .append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
                .x(function(d) {
                    return xScale(d[timeCollumn]);
                })
                .y(function(d) { 
                    return yScale(d[valueCollumn]); 
                })
        );
}

export function LineGraph(dataset, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 550, // width of the chart, in pixels
    height = 480,
    margin = {top: 10, right: 30, bottom: 30, left: 60},
    colors =  d3.schemeTableau10,
    clusterNumber
} = {}){
    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;

    //console.log(svgWidth, svgHeight);

    //console.log(clusterNumber);

    const lineGraphId = "line_graph";
    const lineGraphViewGroupId = "line_graph_view_group";

    let clusterDomain = [];
    for(let i = 0; i <= clusterNumber; i++){
      clusterDomain.push(i);
    }

    const color = d3.scaleThreshold()
                    .domain(clusterDomain)
                    .range(colors);
    //d3.scaleSequential(clusterDomain, colors).unknown("none");

    const svg = d3.create("svg")
    .attr("id", lineGraphId)
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)

    svg.append("g")
    .attr("id", lineGraphViewGroupId)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xScale = d3.scaleLinear()
                .domain([0, 23])
                .range([0, svgWidth - margin.right])//.nice();

    let maxValue = 0;
    let minValue = Infinity;

    //console.log(dataset);

    for(let i = 0; i < clusterDomain.length; i++){
        maxValue = Math.max(maxValue, d3.max(dataset[clusterDomain[i]], function(d){
            return +d[y];
        }));
    }

    for(let i = 0; i < clusterDomain.length; i++){
        minValue = Math.min(minValue, d3.min(dataset[clusterDomain[i]], function(d){
            return +d[y];
        }));
    }

    let yScale = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([svgHeight, 0]);//.nice();

    /*svg.select("#" + lineGraphViewGroupId)
        .append("g")
        .attr("transform", "translate(0, " + svgHeight + ")")
        .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(1))
                .tickFormat(d => { 
                    console.log(d);
                    return d <= d3.timeMonth(d) ? d.getMonth() + 1 : null;})
        );*/

    
    svg.select("#" + lineGraphViewGroupId)
        .append("g")
        .attr("transform", "translate(0, " + svgHeight + ")")
        .call(d3.axisBottom(xScale)
                .ticks(23)
                .tickFormat(function (d, index) {
                    return index;
                })
        );
        
    svg.select("#" + lineGraphViewGroupId)
        .append("g")
        .call(d3.axisLeft(yScale));

    for(let i = 0; i < clusterDomain.length; i++){
        svg.select("#" + lineGraphViewGroupId)
        .append("path")
        .datum(dataset[clusterDomain[i]])
        .attr("fill", "none")
        .attr("stroke", function(d) {
            return color(clusterDomain[i] - 1);
        })
        .attr("stroke-width", 2)
        .attr("d", d3.line()
                .x(function(d) {
                    return xScale(d[x]);
                })
                .y(function(d) { 
                    return yScale(d[y]); 
                })
        ).on("mouseover", function(d){
            svg.selectAll("path")
            .style("opacity", .1);

            d3.select(this)
                .style("opacity", 1);
        }).on("mouseleave", function(d){
            svg.selectAll("path")
            .style("opacity", 1);
        });
    }
    
    return Object.assign(svg.node(), {});
}