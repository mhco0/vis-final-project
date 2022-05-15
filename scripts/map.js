export async function MapGraph(geoJson, gameName, {
    width = 450, // width of the chart, in pixels
    height = 370,
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
        .scale(70)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    // Data and color scale
    const data = new Map();
    const colorScale = d3.scaleThreshold()
        .domain([10, 15, 30, 45, 60, 75, 100])
        .range(d3.schemeBlues[7]);

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

        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .style("opacity", .5)
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mouseLeave = function (d) {
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
            .style("stroke", "#c9d6ff")
            .attr("class", function (d) { return "Country" })
            .style("opacity", .8)
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
    })

    return Object.assign(svg.node(), {});
}