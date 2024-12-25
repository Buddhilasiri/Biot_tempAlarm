const heatmapSize = { width: 300, height: 450 };
const sensors = 9;
const columns = 3;
const rows = 3;
const colors = d3.scaleSequential(d3.interpolateYlOrRd).domain([20, 50]);

const svg = d3
  .select("#heatmap")
  .append("svg")
  .attr("width", heatmapSize.width)
  .attr("height", heatmapSize.height)
  .append("g");

const tooltip = d3.select(".tooltip");

function drawHeatmap(data) {
  const cellWidth = heatmapSize.width / columns;
  const cellHeight = heatmapSize.height / rows;

  const rects = svg.selectAll("rect").data(Object.entries(data));

  rects
    .enter()
    .append("rect")
    .merge(rects)
    .attr("x", (d, i) => (i % columns) * cellWidth)
    .attr("y", (d, i) => Math.floor(i / columns) * cellHeight)
    .attr("width", cellWidth - 5)
    .attr("height", cellHeight - 5)
    .attr("fill", (d) => colors(d[1]))
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 20 + "px")
        .html(`Sensor: ${d[0]}<br>Temperature: ${d[1]}°C`);
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  rects.exit().remove();
}

function fetchSensorData() {
  fetch("http://localhost:3007/api/sensors")
    .then((response) => response.json())
    .then((data) => {
      drawHeatmap(data);
    });
}

setInterval(fetchSensorData, 1000);

