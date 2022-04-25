import { PriceHistoryDomain } from "./datasetControl.js";

export function buildLineGraph(dataset){
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
                .domain([PriceHistoryDomain.begin, PriceHistoryDomain.end])
                .range([0, svgWidth]).nice();

    let yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d){
                    return +d["final_price"];
                })])
                .range([svgHeight, 0]).nice();

    d3.select("#" + lineGraphViewGroupId)
        .append("g")
        .attr("transform", "translate(0, " + svgHeight + ")")
        .call(d3.axisBottom(xScale)
                .ticks(d3.timeMonth.every(1))
                .tickFormat(d => d <= d3.timeMonth(d) ? d.getMonth() : null)
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
                        return xScale(d["date"]);
                    })
                    .y(function(d) { 
                        return yScale(d["final_price"]); 
                    })
            );
    
}