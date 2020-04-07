// Providing the map access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtZG91Y2hpIiwiYSI6ImNrNnM2OWF2azBjN2kza21xYzFnZTNqbG4ifQ.TEgFOFSCPvq0Hu1559yFXA';

// Creating a map in the div #map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hamdouchi/ck6za4ylt0sib1io7x4qp7ypl',
    zoom: 10.5,
    bearing: 10,
    pitch: 35, // pitch in degrees
    center: [-73.950295, 40.735655]
});

//adding the control panel for zoom and moving the map
map.addControl(new mapboxgl.NavigationControl());

/**
 * This function is used for getting the data and calling the draw method
 */
function setup() {
    date_chosen = document.getElementById("#date").value;
    // Using the ternary operator we check if the user wants to view a whole month or just a specific day
    d3.json(date_chosen == "" ? "static/js/taxi/geo_taxi.json" : ("taxi/data/" + date_chosen)).then((d = []) => {
        d3.select(".overlay").classed("hiddenOverlay", true);
        d3.select(".overlay").remove();
        d3.select(".blackBG").remove();
        data_ = d.features;
        drawData(d.features);
    }).catch(er => console.error(er));
}

/**
 * This function transforms the longtitude, langtitude coordinates to x and y coordinates on our svg
 */
function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}

/**
 * This function defines a transform using the projectPoint function
 */
var transform = d3.geoTransform({
    point: projectPoint
});


/**
 * This function returns the start and end point of the path element passed to the function's parametres
 */
function pathStartPointEndPoint(path) {
    var d = path.attr('d');
    d_split_start = d.split("L")[0].slice(1).split(",");
    d_split_end = d.split("L")[d.split("L").length - 1].slice().split(",");

    var point_start = []
    point_start[0] = parseInt(d_split_start[0]);
    point_start[1] = parseInt(d_split_start[1]);

    var point_end = []
    point_end[0] = parseInt(d_split_end[0]);
    point_end[1] = parseInt(d_split_end[1]);

    return [point_start, point_end];
}

/**
 * This function is used to position dots on the map
 */
function translatePoint(d) {
    return "translate(" + d[0] + "," + d[1] + ")";
}

/**
 * This function will append a filter element which will apply a drop shadow to our paths to highlight 
 * the places where we have a lot of taxi circulation
 */
function appendDefs() {
    svg = document.querySelector(".tripsSVG");
    svg.insertAdjacentHTML('beforeend',
        '<defs>'

        +
        '<filter id="glow" width="200%" height="200%">'

        +
        '<feFlood result="flood" flood-color="#FB840E" flood-opacity="1"></feFlood>' +
        '<feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>' +
        '<feMorphology in="mask" result="dilated" operator="dilate" radius="1"></feMorphology>' +
        '<feGaussianBlur in="dilated" result="blurred" stdDeviation="5"></feGaussianBlur>'


        +
        '<feFlood result="flood2" flood-color="#C9447A" flood-opacity="1"></feFlood>' +
        '<feComposite in="flood2" result="mask2" in2="SourceGraphic" operator="in"></feComposite>' +
        '<feMorphology in="mask2" result="dilated2" operator="dilate" radius="3"></feMorphology>' +
        '<feGaussianBlur in="dilated2" result="blurred2" stdDeviation="12"></feGaussianBlur>'


        +
        '<feFlood result="flood3" flood-color="#91255A" flood-opacity="1"></feFlood>' +
        '<feComposite in="flood3" result="mask3" in2="SourceGraphic" operator="in"></feComposite>' +
        '<feMorphology in="mask3" result="dilate3" operator="dilate" radius="2"></feMorphology>' +
        '<feGaussianBlur in="dilate3" result="blurred3" stdDeviation="30"></feGaussianBlur>'

        +
        '<feMerge>' +
        '<feMergeNode in="blurred3"></feMergeNode>' +
        '<feMergeNode in="blurred2"></feMergeNode>' +
        '<feMergeNode in="blurred"></feMergeNode>' +
        '<feMergeNode in="SourceGraphic"></feMergeNode>' +
        '</feMerge>'

        +
        '</filter>'

        +
        '</defs>');
}

/**
 * This function will actually append paths to our svg element so we can visualise the data on form of path and 
 * circles over the map
 */
function drawData(data) {

    //This timefactor might be used later to speed up the viz
    let timeFactor = 5;

    /**
     * Defining a function that will apply the transform on each polygon coordinate and finally
     * build up the d attribute of the path
     */
    let path = d3.geoPath().projection(transform);

    //Creating our svg element and appending it to the Mapbox canvas container
    let svg = d3.select(map.getCanvasContainer()).append("svg");

    //Specfying the namespace of the svg
    svg.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("class", "tripsSVG");

    //Creating the group that will hold our paths and using the filter appended previously on this group
    let g_path = svg.append("g")
        .attr("class", "paths")
        .attr("filter", "url(#glow)");

    //Appending the filter to the svg (drop shadow effect)
    appendDefs();

    //Creating the group that will hold the circles that visualise the pickup points of the taxi trips
    let g_circle_start = svg.append("g").attr("class", "g_circles_start");

    //Creating the group that will hold the circles that visualise the dropoff points of the taxi trips
    let g_circle_end = svg.append("g")
        .attr("class", "g_circles_end");
    let trips = g_path.selectAll(".trips")
        .data(data);

    let tripsPerDay = []
    if (date_chosen != "") {
        for (i = 0; i < 24; i++) {
            if (i == 0)
                tripsPerDay[i + "0h"] = 0;
            else
                tripsPerDay[i + "h"] = 0;
        }
    }
    //Creating empty placeholders for our data because at first we have no paths
    linePath = trips.enter()
        .append("path")
        .attr("class", "default")
        //generating the path
        .attr("d", path)
        //For each path drawn we will draw along two circles for pickup and dropoff
        .each(function (d) {
            if (date_chosen == "") {
                dateToTest = new Date(d.properties.pickup_datetime).toLocaleDateString();
            } else {
                d3.select("#graph-header").text("Hourly stats")
                dateToTest = new Date(d.properties.pickup_datetime).getHours() + "H";
            }
            //counting the number of trips per day
            if (!tripsPerDay[dateToTest]) { // if no key for that number yet
                tripsPerDay[dateToTest] = 0; // then make one
            }

            ++tripsPerDay[dateToTest]; // increment the property for that number

            //Getting the pickup and dropoff coordinates from the path
            let points = pathStartPointEndPoint(d3.select(this));

            //Getting the pickup coordinates
            let point_start = points[0];

            //Giving the path an id of the pickup and dropoff coordinates, it will be used later for a transition
            d3.select(this).attr("id", "id_" + points.toString());

            //creating the a pickup circles based on the path we drawn
            let start = g_circle_start
                .append("circle")
                .attr("r", 1.8)
                .attr("fill", "#00E676")
                //positining the circle at the start of the path 
                .attr("transform", function () {
                    return translatePoint(point_start);
                });

            //Getting the dropoff coordinates	
            let point_end = points[1];

            //creating the a dropoff circles based on the path we drawn
            let end = g_circle_end
                .append("circle")
                .attr("r", 1.8)
                .attr("opacity", "0")
                .attr("fill", "#940128")
                //positining the circle at the start of the path 
                .attr("transform", function () {
                    return translatePoint(point_end);
                })

            /**
             * Giving the pickup and dropoff points the same id as the current path so that each trip will be easily
             * accessible (you can call it a primary key for each trip)
             */

            let ref = this;
            start.attr("class", d3.select(ref).attr("id") + "Start " + "circle" + figureTime(d.properties.pickup_datetime));
            end.attr("class", d3.select(ref).attr("id") + "End " + "circle" + figureTime(d.properties.pickup_datetime));
        })
    initChart(tripsPerDay)
    /**
     * Animating the path using a transtion in which the duration will be the time of the trip
     * of course we are gonna use the timefactor to speed up the transition
     */
    g_path.selectAll("path")
        .attr("stroke-dasharray", function () {
            var totalLength = this.getTotalLength();
            return totalLength + " " + totalLength;
        })
        .attr("stroke-dashoffset", function () {
            var totalLength = this.getTotalLength();
            return totalLength;
        })
        .transition()
        .duration(function (d) {

            //calculate seconds
            let start = Date.parse(d.properties.pickup_datetime);
            let finish = Date.parse(d.properties.dropoff_datetime);
            let duration = finish - start;

            //convert to minutes
            duration = duration / 60000;

            //this will be used later if we want to speed up the animation
            duration = duration * (1 / timeFactor) * 1000;
            let ref = this;
            setTimeout(function () {
                document.getElementsByClassName(d3.select(ref).attr('id') + "End")[0]
                    .setAttribute("opacity", "1");
            }, duration);
            return duration;
        })
        .attr("stroke-dashoffset", 0);
    /**
     * These three lines only get executed if there is another call for this function in a sense
     * that if the data changed they will remove the corresponding dom element to the data
     */
    linePath.exit().remove();
    g_circle_end.selectAll("circle").exit().remove();
    g_circle_start.selectAll("circle").exit().remove();

}

/**
 * Defining a function that gets executed when the map is zoomed in or out
 */
map.on("viewreset", function () {

    //Replacing the d attribue by a new one that is generated by the geoPath function
    d3.selectAll(".paths path").attr("d", d3.geoPath().projection(transform));

    d3.selectAll(".paths path").each(function () {
        // Getting the start and end point of the current path
        let points = pathStartPointEndPoint(d3.select(this));

        let point_start = points[0];
        let point_end = points[1];

        // Using the point_start variable and the function translatePoint we translate all the start points 
        //so that they stick to the path
        document.getElementsByClassName(d3.select(this).attr('id') + "Start")[0]
            .setAttribute("transform", translatePoint(point_start));

        // Same as the start points, we translate the end points
        document.getElementsByClassName(d3.select(this).attr('id') + "End")[0]
            .setAttribute("transform", translatePoint(point_end));
    });
});

/**
 * Defining a function that gets executed when the map is moved, 
 * which has the same treatment as the previous function
 */
map.on("move", function () {
    d3.selectAll(".paths path").attr("d", d3.geoPath().projection(transform));
    d3.selectAll(".paths path").each(function () {

        let points = pathStartPointEndPoint(d3.select(this));

        let point_start = points[0];
        let point_end = points[1];

        document.getElementsByClassName(d3.select(this).attr('id') + "Start")[0]
            .setAttribute("transform", translatePoint(point_start));

        document.getElementsByClassName(d3.select(this).attr('id') + "End")[0]
            .setAttribute("transform", translatePoint(point_end));

    });
});

/**
 * Adding an on click listener on the begin Button in which we display the "Loading data.." text 
 * and disabling the clicked button 
 */
document.getElementById("beginButton").addEventListener("click", () => {
    d3.select("#loadingText").attr("style", "display:inline");
    d3.select("#beginButton").attr("disabled", "true");
    setup();
});

/**
 * Adding an on change listener on the trips start points checkbox, so that we can hide the start points when
 * the checkbox is unchecked and show them when it's checked
 */
document.querySelector("#startPointsInput").addEventListener('change', (event) => {
    if (event.target.checked) {
        d3.selectAll(".g_circles_start circle").classed("hiddenCircle", false);
    } else {
        d3.selectAll(".g_circles_start circle").classed("hiddenCircle", true);
    }
});

/**
 * Adding an on change listener on the trips end points checkbox, so that we can hide the end points when
 * the checkbox is unchecked and show them when it's checked
 */
document.querySelector("#endPointsInput").addEventListener('change', (event) => {
    if (event.target.checked) {
        d3.selectAll(".g_circles_end circle").classed("hiddenCircle", false);
    } else {
        d3.selectAll(".g_circles_end circle").classed("hiddenCircle", true);
    }
});
/**
 * This functions is used to figure if the path was in the day or night
 */
function figureTime(date) {
    return (new Date(date).getHours() >= 8 && new Date(date).getHours() <= 20) ? "day" : "night";
}

/**
 * This functions is used to query our data by a value given through the timeline
 */
function queryData(data = [], date_chosen) {
    return data.filter(function (item) {
        return (new Date(item.properties.pickup_datetime).toLocaleDateString() == date_chosen)
    });
}

document.querySelector("#dayTripsInput").addEventListener('change', (event) => {


    if (event.target.checked) {

        document.querySelector("#allTripsInput").checked = false;

        if (!document.querySelector("#nightTripsInput").checked) {
            d3.selectAll(".paths path")
                .attr("class", (d) => {
                    if (figureTime(d.properties.pickup_datetime) == "night") {
                        d3.selectAll("circle.circlenight")
                            .classed("hiddenCircle", true);
                        return "hidden";
                    } else {
                        d3.selectAll("circle.circleday")
                            .classed("hiddenCircle", false);
                        return "day";
                    }
                })
        } else {
            d3.selectAll(".paths path")
                .attr("class", (d) => {
                    d3.selectAll("circle")
                        .classed("hiddenCircle", false);
                    if (figureTime(d.properties.pickup_datetime) == "night") {
                        return "night";
                    } else {
                        return "day";
                    }
                })
        }

    } else {
        d3.selectAll(".paths path")
            .attr("class", (d) => {
                if (figureTime(d.properties.pickup_datetime) == "day") {
                    d3.selectAll("circle.circleday")
                        .classed("hiddenCircle", true);
                    return "hidden";
                } else {
                    if (document.querySelector("#nightTripsInput").checked) {
                        d3.selectAll("circle.circlenight")
                            .classed("hiddenCircle", false);
                        return "night";
                    }
                }

            })
    }

});

document.querySelector("#allTripsInput").addEventListener('change', (event) => {
    if (event.target.checked) {
        document.querySelector("#dayTripsInput").checked = false;
        document.querySelector("#nightTripsInput").checked = false;
        d3.selectAll(".paths path")
            .attr("class", "default");
        d3.selectAll("circle")
            .classed("hiddenCircle", false);
    } else {
        d3.selectAll(".paths path")
            .attr("class", "hidden");
        d3.selectAll("circle")
            .classed("hiddenCircle", true);
    }
});

document.querySelector("#nightTripsInput").addEventListener('change', (event) => {


    if (event.target.checked) {
        document.querySelector("#allTripsInput").checked = false;

        if (!document.querySelector("#dayTripsInput").checked) {
            d3.selectAll(".paths path")
                .attr("class", (d) => {
                    if (figureTime(d.properties.pickup_datetime) == "day") {
                        d3.selectAll("circle.circleday")
                            .classed("hiddenCircle", true);
                        return "hidden";
                    } else {
                        d3.selectAll("circle.circlenight")
                            .classed("hiddenCircle", false);
                        return "night";
                    }
                })
        } else {
            d3.selectAll(".paths path")
                .attr("class", (d) => {
                    d3.selectAll("circle")
                        .classed("hiddenCircle", false);
                    if (figureTime(d.properties.pickup_datetime) == "day") {
                        return "day";
                    } else {
                        return "night";
                    }
                })
        }

    } else {
        d3.selectAll(".paths path")
            .attr("class", (d) => {
                if (figureTime(d.properties.pickup_datetime) == "night") {
                    d3.selectAll("circle.circlenight")
                        .classed("hiddenCircle", true);
                    return "hidden";
                } else {
                    if (document.querySelector("#dayTripsInput").checked) {
                        d3.selectAll("circle.circleday")
                            .classed("hiddenCircle", false);
                        return "day";
                    }
                }
            })
    }

});

document.querySelector("#allTripsNightDayInput").addEventListener('change', (event) => {
    if (event.target.checked) {
        document.querySelector("#dayTripsInput").checked = false;
        document.querySelector("#nightTripsInput").checked = false;

        d3.selectAll(".paths path")
            .attr("class", (d) => {
                d3.selectAll("circle")
                    .classed("hiddenCircle", false);
                if (figureTime(d.properties.pickup_datetime) == "night") {
                    return "night";
                } else {
                    return "day";
                }
            })
    } else {
        d3.selectAll(".paths path")
            .attr("class", "hidden");
        d3.selectAll("circle")
            .classed("hiddenCircle", true);
    }
});

function initChart(data = []) {
    let svg = d3.select('svg.chart');
    // Setting the width and height depending on the size of the screen
    let svgWidth = document.getElementById("graphWrapper").clientWidth - 10;
    let svgHeight = document.getElementById("graphWrapper").clientHeight;

    // Creating margins so that the line chart won't take the whole svg width
    let margin = {
        top: 20,
        right: 0,
        bottom: 50,
        left: 40
    };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;

    // Since our data values might big we use d3 scales to map our data to values that actually fit the screen
    let y = d3.scaleLinear()
        .domain([0, d3.max(Object.keys(data).map(d => {
            return data[d];
        }))])
        .range([height, 0]);
    let x = d3.scaleBand()
        .domain(Object.keys(data))
        .range([0, width])
        .paddingInner(0.1);

    //grouping svg elements can be very helpful if we want for example to add text next to an svg element
    let g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);;
    let bars  = g.selectAll(".bar")
        .data(Object.keys(data))
    let newBars =    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(0);
        }) // always equal to 0
        .attr("y", function (d) {
            return y(0);
        })
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axisBottom")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axisLeft")
        .call(d3.axisLeft(y).ticks(6))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("color", "white")
        .text("Trips");

    let tooltip = d3.select('.graph-tip');

    function onMouseOut() {
        tooltip.classed(".graph-tip", false);
        tooltip.html('');
    }

    function onMouseOver(d) {
        tooltip.classed(".graph-tip", true);
        tooltip.html(d + ' - Trips: ' + data[d])
            .style('left', x(d) + 39 + 'px');
    }

    //adding animation
    g.selectAll('rect')
        .transition()
        .duration(3000)
        .ease(d3.easeSin)
        .attr("y", function (d) {
            return y(data[d])
        })
        .attr("height", function (d) {
            return height - y(data[d])
        })
        .style("opacity", "1");

    newBars.exit().remove();

}