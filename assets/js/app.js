// Chart parameters
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty"
var chosenYAxis = "obesity"

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=> d[chosenXAxis]),
            d3.max(data, d => d[chosenXAxis])
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=> d[chosenYAxis]),
            d3.max(data, d => d[chosenYAxis])
        ])
        .range([height, 0]);
    
    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new x circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// Function used for updating circles group with a transition to new y circles
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
        .attr("dy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function for updating text location (x)
function renderXText(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesGroup
}

// Function for updating text location (y)
function renderYText(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));

    return circlesGroup
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty (%):";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age:"
    }
    else {
        xLabel = "Household Income ($):"
    }

    var yLabel;

    if (chosenYAxis === "obesity") {
        yLabel = "Obesity (%):"
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes (%):"
    }
    else {
        yLabel = "Lacks Healthcare (%):"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// Retrieve data from the CSV file
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // Parse data
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale function
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Append inital circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("g")
    
    var circles = circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);

    // Append text inside circles
    var circlesText = circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
        .classed("stateText", true);

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", -80)
        .attr("x", -(height/2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", -60)
        .attr("x", -(height/2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");
    
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", -40)
        .attr("x", -(height/2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // Update ToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // Replaces chosenXAxis with value
                chosenXAxis = value;
                
                // Updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);
                
                // Updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                
                // Updates circles with new x values
                circles = renderXCircles(circles, xLinearScale, chosenXAxis);

                // Update circles with new text
                circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // Replaces chosenYAxis with value
                chosenYAxis = value;
                
                // Updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);
                
                // Updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
                
                // Updates circles with new y values
                circles = renderYCircles(circles, yLinearScale, chosenYAxis);

                // Update circles with new text
                circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Change classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "healthcare"){
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
});