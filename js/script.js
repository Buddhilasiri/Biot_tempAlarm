// Dark Mode Toggle
const darkModeCheckbox = document.getElementById("dark-mode-checkbox");

// Load initial state from localStorage
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeCheckbox.checked = true;
}

darkModeCheckbox.addEventListener("change", () => {
  if (darkModeCheckbox.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
  }
});

// Heatmap Logic
const heatmapSize = { width: 300, height: 450 };
const colors = d3.scaleSequential(d3.interpolateYlOrRd).domain([20, 50]);

const svg = d3
  .select("#heatmap")
  .append("svg")
  .attr("width", heatmapSize.width)
  .attr("height", heatmapSize.height)
  .append("g");

const tooltip = d3.select(".tooltip");

function drawHeatmap(data) {
  const cellWidth = heatmapSize.width / 3;
  const cellHeight = heatmapSize.height / 3;

  const rects = svg.selectAll("rect").data(Object.entries(data));

  rects
    .enter()
    .append("rect")
    .merge(rects)
    .attr("x", (d, i) => (i % 3) * cellWidth)
    .attr("y", (d, i) => Math.floor(i / 3) * cellHeight)
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

// Generate Color Chart
function generateColorChart() {
  const chart = d3.select("#color-chart ul");

  for (let i = 20; i <= 50; i += 5) {
    chart
      .append("li")
      .html(
        `<div class="color-box" style="background:${colors(i)};"></div>${i}°C`
      );
  }
}

generateColorChart();
setInterval(fetchSensorData, 1000);
