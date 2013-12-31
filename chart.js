//*****************************************************************************
// Copyright © 2013 Waters Corporation. All rights reserved.
//*****************************************************************************
'use strict';

var margin = {top: 10, right: 20, bottom: 40, left: 80};
//    var width = 960 - margin.left - margin.right;
//    var height = 500 - margin.top - margin.bottom;
var width = 1450;
var height = 300;

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
        .on("mouseup", function(d,i) {
            console.log("mouseUp!!");
        })
        .on("mousedown", function(d,i) {
            console.log("mouseDown!!");

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

    // Add peak labels!!
    svg.selectAll("text").
        data(bins).
        enter().
        append("svg:text").
        attr("x", function(d, index) {
            return x(d.Mass);
        }).
        attr("y", function(d) {
            return y(d.Intensity) - 15;
        }).
        attr("dx", - 1/2).
        attr("dy", "1.2em").
        attr("text-anchor", "middle").
        text(function(datum) {
            return datum.Mass;
        }).
        attr("fill", "black");





    var g = d3.select("svg");

    g.append( "rect")
        .attr({
            rx      : 0,    // round the corners of the rectangle
            ry      : 0,
            class   : "region",
            x       : margin.left,
            y       : margin.top,
            width   : width,
            height  : height
        });


    g.on( "mousedown", function() {
        console.log("mousedown!!");

        if (!d3.event.ctrlKey) {
            d3.selectAll( 'g.selected').classed( "selected", false);
        }

        var p = d3.mouse( this);    // get the current mouse position

        g.append( "rect")
            .attr({
                rx      : 6,    // round the corners of the rectangle
                ry      : 6,
                class   : "selection",
                x       : p[0],
                y       : p[1],
                width   : 0,
                height  : 0
            })
        })
        .on( "mousemove", function() {
            console.log("mousemove!!");

            var s = g.select( "rect.selection");

            if( !s.empty()) {
                var p = d3.mouse( this),
                    d = {
                        x       : parseInt( s.attr( "x"), 10),
                        y       : parseInt( s.attr( "y"), 10),
                        width   : parseInt( s.attr( "width"), 10),
                        height  : parseInt( s.attr( "height"), 10)
                    },
                    move = {
                        x : p[0] - d.x,
                        y : p[1] - d.y
                    }
                    ;

                if( move.x < 1 || (move.x*2<d.width)) {
                    d.x = p[0];
                    d.width -= move.x;
                } else {
                    d.width = move.x;
                }

                if( move.y < 1 || (move.y*2<d.height)) {
                    d.y = p[1];
                    d.height -= move.y;
                } else {
                    d.height = move.y;
                }

                s.attr( d);

                // deselect all temporary selected state objects
                d3.selectAll( 'g.state.selection.selected').classed( "selected", false);

                d3.selectAll( 'g.state >circle.inner').each( function( state_data, i) {
                    if(
                        !d3.select( this).classed( "selected") &&
                            // inner circle inside selection frame
                            state_data.x-radius>=d.x && state_data.x+radius<=d.x+d.width &&
                            state_data.y-radius>=d.y && state_data.y+radius<=d.y+d.height
                        ) {

                        d3.select( this.parentNode)
                            .classed( "selection", true)
                            .classed( "selected", true);
                    }
                });
            }


        })
        .on( "mouseup", function() {
            console.log("mouseup!!");
            // remove selection frame
            g.selectAll( "rect.selection").remove();

            // remove temporary selection marker class
            d3.selectAll( 'g.state.selection').classed( "selection", false);

        });


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
