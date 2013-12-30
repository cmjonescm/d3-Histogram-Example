//*****************************************************************************
// Copyright © 2013 Waters Corporation. All rights reserved.
//*****************************************************************************
'use strict';

var margin = {top: 10, right: 20, bottom: 40, left: 80};
//    var width = 960 - margin.left - margin.right;
//    var height = 500 - margin.top - margin.bottom;
var width = 1000;
var height = 600;

// create an svg element at the bottom of the body element
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Load the data
d3.csv("scan.csv", function(bins) {

    // Coerce types.
    bins.forEach(function(bin) {
        bin.Mass = + bin.Mass;
        bin.Intensity = + bin.Intensity;
    });

    // Set the scale domains.
    x.domain([100, 1000]);  // mass range
    //x.domain([0, d3.max(bins.map(function(d) { return d.Mass; }))]).nice();
    y.domain([0, d3.max(bins.map(function(d) { return d.Intensity; }))]).nice();

    // plot the data!!
    svg.selectAll(".bin")
        .data(bins)   // - data to plot
        .enter().append("line")
        .attr("class", "bin")
        .on("mousedown", function(d,i) {

            if (d3.select(this).attr("class") == 'selected') {
                d3.select(this).attr("class", "bin");
            }
            else {
                d3.select(this).attr("class", "selected");
            }
        })
        // plot the stick data
        .attr("x1", function(d) { return x(d.Mass); })
        .attr("x2", function(d) { return x(d.Mass); })
        .attr("y1", height)
        .attr("y2", function(d) { return y(d.Intensity); });

    //Create X axis label
    svg.append("text")
        .attr("x", width / 2 )
        .attr("y", height + margin.bottom )
        .attr("class", "axisLabel")
        .style("text-anchor", "middle")
        .text("Mass m/z");

    // <g> element is used to group SVG shapes together
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom"));

    //Create Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisLabel")
        // .style("text-anchor", "middle")
        .text("Intensity");

    // <g> element is used to group SVG shapes together
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis()
            .scale(y)
            .orient("left"));

});
