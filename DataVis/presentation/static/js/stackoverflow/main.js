/**
 * this function calls the fetch static method of the connection class in the ./fetch.js file and executes
 * for the first time the visualization.
 */
function get_data(type) {
    Connection.instance().then((data = []) => {
        data.map(d => {
            d.date = new Date(d.date);
            d.reputation = +d.reputation;
        });
        if (type == "barChart")
            visualize_bar_chart([...data].sort((a, b) => b.date - a.date));

        else if (type == "lineChart")
            visualize_line_chart(data);
    });
}
/**
 * this function is for the bar chart visualization.
 */
function visualize_bar_chart(data_) {

    // You can consider this as our canvas where all our dom element will be
    let svg = d3.select('svg');

    // Setting the width and height depending on the size of the screen
    let svgWidth = document.getElementById("chart").clientWidth - 10;
    let svgHeight = document.getElementById("chart").clientHeight;

    // Creating margins so that the line chart won't take the whole svg width
    let margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 140
    };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;

    //format of the date that will get shown
    const dateFormater = d3.timeFormat("%d %b, %Y");

    // Consider this as getters of our json objects' properties
    let xValue = d => d.reputation;
    let yValue = d => dateFormater(d.date);

    // Since our data values might big we use d3 scales to map our data to values that actually fit the screen
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(data_, xValue)])
        .range([0, width]);
    let yScale = d3.scaleBand()
        .domain(data_.map(yValue))
        .range([0, height])
        .paddingInner(0.99);

    //grouping svg elements can be very helpful if we want for example to add text next to an svg element
    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //selecting all rectangles
    g.selectAll('rect')
        //adding data that we want to bind to our dom elements
        .data(data_)
        //enter will create empty placeholders for our data because at first we have no rectangles
        .enter()
        //now we add rectangles for each empty placeholder
        .append('rect')
        .style("opacity", "0")
        .attr("class", "bar")
        //without this treatment all the rectangles will be tangled in the same place
        .attr('y', d => yScale(yValue(d)))
        .attr('x', 0)
        .attr('width', 0)
        //bandwidth uses the number of data to calculate an appropriate height for out bars
        .attr('height', yScale.bandwidth() * 60)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

    //adding animation
    g.selectAll('rect')
        .transition()
        .duration(1500)
        .ease(d3.easeSin)
        .attr('width', d => xScale(xValue(d)))
        .style("opacity", "1");

    //drawing the x-axis
    let xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight);
    g.append('g')
        .call(xAxis)
        .attr('transform', `translate(0,${height + yScale.bandwidth()*60 + 10})`)
        .select('.domain')
        .remove();

    //adding events for our bars
    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
            .transition()
            .duration(400);

        g.append("text")
            .attr('class', 'val')
            .attr('x', xScale(xValue(d)) + 10)
            .attr('y', yScale(yValue(d)) + 8.3)
            .text(xValue(d));
        g.append("text")
            .attr('class', 'val')
            .attr('x', -100)
            .attr('y', yScale(yValue(d)) + 8.3)
            .text(yValue(d));

    }

    function onMouseOut(d, i) {
        d3.select(this).attr('class', 'bar');
        d3.select(this)
            .transition()
            .duration(400)
            .attr('height', yScale.bandwidth() * 60);
        d3.selectAll('.val')
            .remove()
    }
}

function visualize_line_chart(data_) {
    let svg = d3.select('svg');
    let width = document.getElementById("chart").clientWidth;
    let height = document.getElementById("chart").clientHeight;

    //  creating an array of strings that will be used later for the tooltip
    let months = ["Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"
    ];

    // this function takes one object of our array of json objects and returns the date value
    let xValue = d => d.date;

    // as the previous one, this function takes one object of our array of json objects and returns the reputation value
    let yValue = d => d.reputation;

    // creating margins so that the line chart won't take the whol svg width
    let margin = {
        top: 60,
        right: 40,
        bottom: 88,
        left: 105
    };
    let innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bottom;

    // defining a function that constructs a linear scale to map the dates to numbers
    let xScale = d3.scaleTime()
        .domain(d3.extent(data_, xValue))
        .range([0, innerWidth]);

    // defining a function that constructs a linear scale to map the reputations to numbers
    let yScale = d3.scaleLinear()
        .domain(d3.extent(data_, yValue))
        .range([innerHeight, 0])
        .nice();

    // this g element will group all our scales and charts
    let g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // creating the horizontal axis and grid
    let xAxis = d3.axisBottom(xScale)
        .ticks(7)
        .tickSize(-innerHeight)
        .tickPadding(10);

    // creating the vertical axis and grid
    let yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

    // drawing the x-axis
    g.append('g').call(yAxis);

    // draw the y-axis and translating it to the bottom of the g element previously declared
    g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    // defining a function that creates a line shape following a sequence of points
    let lineGenerator = d3.line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)));

    // appending a path that its shape defined by the lineGenerator function
    let linePath = g.append('path')
        .attr('class', 'line-path')
        .attr('d', lineGenerator(data_));

    //getting the length of  the line path
    let pathLength = linePath.node().getTotalLength();

    //animating the line path
    linePath
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // defining a function that creates an area (a filled line shape) following a sequence of points
    var areaGenerator = (datum, boolean) => {
        return d3.area()
            .y0(innerHeight)
            .y1(d => {
                return boolean ? yScale(yValue(d)) : 0;
            })
            .x(d => {
                return xScale(xValue(d))
            })
            (datum);
    }

    // appending a path that its shape defined by the areaGenerator function and animating it
    g.append('path')
        .attr('class', 'area-path')
        .attr("d", areaGenerator(data_, false))
        .transition()
        .duration(1000)
        .attr("d", areaGenerator(data_, true));

    // crating and appending a g element that will hold the upper tooltip
    let upperToolTip = g.append("g")
        .attr("class", "upperToolTip")
        .attr("opacity", 0);

    // appending a path the g element created above
    upperToolTip.append("path")
        .attr("d", `M${-50},5H-5l5,-5l5,5H${50}v${35}h-${100}z`);

    // appending a text element that will represent the reputation on a specific point on the line chart
    upperToolTip
        .append("text")
        .attr("class", "upperToolTipText");

    // creating another group for the bottom toolTip
    let bottomToolTip = g.append("g")
        .attr("class", "bottomToolTip")
        .attr("opacity", 0);

    bottomToolTip
        .append("rect")
        .attr("width", 130)
        .attr("height", 40);

    bottomToolTip
        .append("text")
        .attr("class", "bottomToolTipText");

    // this function defines a date variable and updates the location and text of both the upper and bottom tooltips 
    let updateToolTips = (d) => {

        let date = `${xValue(d).getDate()} ${months[xValue(d).getMonth()]} ${xValue(d).getFullYear()}`;
        upperToolTip
            .style("opacity", 100)
            .attr("transform", `translate(${xScale(xValue(d))},${yScale(yValue(d))})`)
            .select(".upperToolTipText").text(parseInt(yValue(d)));

        bottomToolTip
            .style("opacity", 100)
            .attr("transform", `translate(${xScale(xValue(d))},${innerHeight})`)
            .select(".bottomToolTipText").text(date);
    }

    // appending a rectangle of a width and height equal to the first g element defined, and which will respond to the mouse events
    g.append("rect")
        .attr("class", "overlay")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    // this functions gets called on mouse move events, and what it does is it gets the closest date to the mouse pointer location 
    // and then it defines a new data array the containts the date and reputation that is close to the cursor. Finally it calls
    // the updateToolTip function 
    function mousemove() {

        let bisectDate = d3.bisector(xValue).left;

        let x0 = xScale.invert(d3.mouse(this)[0]);
        let i = bisectDate(data_, x0, 1);
        let d0 = data_[i - 1];
        let d1 = data_[i];
        let d = x0 - xValue(d0) > xValue(d1) - x0 ? d1 : d0;

        updateToolTips(d);
    }

    // on mouse out, this function gets called and it makes the tooltips invisible by making their opacities equal to 0
    function mouseout() {

        upperToolTip
            .transition()
            .style("opacity", 0)
            .style('pointer-events', 'none');

        bottomToolTip
            .transition()
            .style("opacity", 0)
            .style('pointer-events', 'none');
    }



}
/**
 * to make our chart responsive, we declared a method that gets called when the window 
 * is resized and what it does is it deletes all the elements inside the root element
 * (i.e svg) and it calls the function 
 */
function resize_chart() {
    d3.select("svg").selectAll("*").remove();
    changeVisualization();
}
/**
 * this is called on the onchange event of the dropdown menu (html-select)
 */
function changeVisualization() {
    var select = document.getElementById("choice");
    chartType = select.options[select.selectedIndex].value;

    if (chartType == "barChart") {
        d3.select("svg").selectAll("*").remove();
        get_data("barChart");
    } else if (chartType == "lineChart") {
        d3.select("svg").selectAll("*").remove();
        get_data("lineChart");
    }
}

d3.select(window).on('resize', resize_chart);

get_data("lineChart");