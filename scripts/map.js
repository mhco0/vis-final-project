export async function MapGraph(geoJson, gameName, {
    width = 550,//450, // width of the chart, in pixels
    height = 450,//370,
    margin = { top: 10, right: 30, bottom: 30, left: 60 },
} = {}) {
    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;

    const mapGraphId = "map_graph";

    //SVG
    const svg = d3.create("svg")
        .attr("id", mapGraphId)
        .attr("width", svgWidth + margin.left + margin.right)
        .attr("height", svgHeight + margin.top + margin.bottom)


    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
                        .rotate([-11, 0])
                        .scale(75)
                        .center([0, 20])
                        .translate([width / 2, height / 2]);
        //.scale(70)
        //.center([0, 20])
        //.translate([width / 2, height / 2]);

    // Data and color scale
    const data = new Map();
    const colorScale = d3.scaleThreshold()
        .domain([1, 5, 10, 15, 20, 30, 45, 60, 75, 100])
        .range(d3.schemeBlues[9]);
        //.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

    // Get trends from API and boot
    await Promise.all([
        d3.json(`http://localhost:9000/InterestByRegion?search=${gameName}`),
    ]).then(function (result) {
        let topo = geoJson;
        let trends = result[0];
        let countries = Object.keys(trends);

        countries.forEach(country => {
            let id = country;

            if (country == "United States") {
                id = "USA";
            } else if (country == "United Kingdom") {
                id = "England";
            } else if (country.includes('&')) {
                id = country.replace('&', 'and');
            }

            data.set(id, trends[country][gameName]);
        });

        // create a tooltip
        var Tooltip = d3.select("#map_graph_div")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .html( `<strong></strong><br/>Total:`)

        let mouseOver = function (d) {
            Tooltip.style("opacity", 1)
            d3.selectAll(".Country")
                .style("opacity", .5)
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mouseMove = function (event, d) {
            Tooltip
                .html( `<strong>${d.properties.name}</strong><br/>Total: ${d.total}`)
                .style("left", (event.x) / 2 + "px")
                .style("top", (event.y) / 2 - 30 + "px")
        }

        let mouseLeave = function (d) {
            Tooltip.style("opacity", 0)
            d3.selectAll(".Country")
                .style("opacity", .8)
            d3.select(this)
                .style("stroke", "#c9d6ff")
        }

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .join("path")
            // draw each country
            .attr("d", path
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.properties.name) || 0;
                return colorScale(d.total);
            })
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)
            .attr("class", function (d) { return "Country" })
            .style("stroke", "#c9d6ff")
            .style("opacity", .8)


    })

    return Object.assign(svg.node(), {});
}