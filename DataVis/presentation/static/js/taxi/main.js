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
	let date = document.getElementById("#date").value;
	//using the ternary operator we check if the user wants to view a whole month or just a specific day
	d3.json(date == "" ? "static/js/taxi/geo_taxi.json" : ("taxi/data/" + date)).then((d = []) => {
		d3.select(".overlay").classed("hiddenOverlay", true);
		d3.select(".overlay").remove();
		d3.select(".blackBG").remove();
		drawData(d);
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

			+ '<filter id="glow" width="200%" height="200%">'
			
				+'<feFlood result="flood" flood-color="#FB840E" flood-opacity="1"></feFlood>' 
				+'<feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>' 
				+'<feMorphology in="mask" result="dilated" operator="dilate" radius="1"></feMorphology>' 
				+'<feGaussianBlur in="dilated" result="blurred" stdDeviation="5"></feGaussianBlur>'

			
				+'<feFlood result="flood2" flood-color="#C9447A" flood-opacity="1"></feFlood>' 
				+'<feComposite in="flood2" result="mask2" in2="SourceGraphic" operator="in"></feComposite>' 
				+'<feMorphology in="mask2" result="dilated2" operator="dilate" radius="3"></feMorphology>' 
				+'<feGaussianBlur in="dilated2" result="blurred2" stdDeviation="12"></feGaussianBlur>'

			
				+'<feFlood result="flood3" flood-color="#91255A" flood-opacity="1"></feFlood>' 
				+'<feComposite in="flood3" result="mask3" in2="SourceGraphic" operator="in"></feComposite>' 
				+'<feMorphology in="mask3" result="dilate3" operator="dilate" radius="2"></feMorphology>' 
				+'<feGaussianBlur in="dilate3" result="blurred3" stdDeviation="30"></feGaussianBlur>'

				+'<feMerge>' 
					+'<feMergeNode in="blurred3"></feMergeNode>' 
					+'<feMergeNode in="blurred2"></feMergeNode>' 
					+'<feMergeNode in="blurred"></feMergeNode>'
					+'<feMergeNode in="SourceGraphic"></feMergeNode>'
				+'</feMerge>'

			+'</filter>'

		+'</defs>');
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
	g_circle_start = svg.append("g").attr("class", "g_circles_start");

	//Creating the group that will hold the circles that visualise the dropoff points of the taxi trips
	g_circle_end = svg.append("g").attr("class", "g_circles_end");
	trips = g_path.selectAll(".trips").data(data.features);

	//Creating empty placeholders for our data because at first we have no paths
	linePath = trips.enter()
		.append("path")
		.attr("class", "trips")
		//generating the path
		.attr("d", path)
		//For each path drawn we will draw along two circles for pickup and dropoff
		.each(function () {

			//Getting the pickup and dropoff coordinates from the path
			let points = pathStartPointEndPoint(d3.select(this));

			//Getting the pickup coordinates
			let point_start = points[0];

			//Giving the path an id of the pickup and dropoff coordinates, it will be used later for a transition
			d3.select(this).attr("id","id_" + points.toString());

			//creating the pickup circles using the same d3 function for drawing the path
			g_circle_start.selectAll(".circles_start")
				.data(point_start)
				.enter()
				.append("circle")
				.attr("class", "circles_start")
				.attr("r", 1.8)
				.attr("fill", "#00E676")
				//positining the circle at the start of the path 
				.attr("transform", function () {
					return translatePoint(point_start);
				});

			//Getting the dropoff coordinates	
			let point_end = points[1];

			//Creating the dropoff circles using the same d3 function for drawing the path
			g_circle_end.selectAll(".circles_end")
				.data(point_end)
				.enter()
				.append("circle")
				.attr("class", "circles_end")
				.attr("r", 1.8)
				.attr("opacity", "0")
				.attr("fill", "#940128")
				.attr("transform", function () {
					return translatePoint(point_end);
				})
			
			/**
			 * Giving the pickup and dropoff points the same id as the current path so that each trip will be easily
			 * accessible (you can call it a primary key for each trip)
			*/
			g_circle_end.selectAll(".circles_end")
				.attr("class",d3.select(this).attr("id") + "End");

			g_circle_start.selectAll(".circles_start")
				.attr("class",d3.select(this).attr("id") + "Start");
		})

	/**
	 * Animating the path using a transtion in which the duration will be the time of the trip
	 * of course we are gonna use the timefactor to speed up the transition
	*/
	g_path.selectAll(".trips")
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
			let	finish = Date.parse(d.properties.dropoff_datetime);
			let	duration = finish - start;
			
			//convert to minutes
			duration = duration / 60000;

			//this will be used later if we want to speed up the animation
			duration = duration * (1 / timeFactor) * 1000;
			let ref = this;
			setTimeout(function () {
				let point_end = document.getElementsByClassName(d3.select(ref).attr('id') + "End")[0]
					.setAttribute("opacity", "1");

				// console.log(ref)
				// for (let i = 0; i < point_end.length; i++) {
				// 	point_end[i].setAttribute("opacity", "1");
				// }

			}, duration)
			return duration;
		})
		.attr("stroke-dashoffset", 0);
	/**
	 * These three lines only get executed if there is another call for this function in a sense
	 * that if the data changed they will remove the corresponding dom element to the data
	*/
	trips.exit().remove();
	g_circle_end.selectAll("circle").exit().remove();
	g_circle_start.selectAll("circle").exit().remove();

}

/**
 * Defining a function that gets executed when the map is zoomed in or out
 */
map.on("viewreset", function () {

	//Replacing the d attribue by a new one that is generated by the geoPath function
	d3.selectAll(".trips").attr("d", d3.geoPath().projection(transform));

	d3.selectAll(".trips").each(function () {
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
	d3.selectAll(".trips").attr("d", d3.geoPath().projection(transform));
	d3.selectAll(".trips").each(function () {

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
		d3.selectAll(".g_circles_start").style("opacity", 1);
	} else {
		d3.selectAll(".g_circles_start").style("opacity", 0);
	}
});

/**
 * Adding an on change listener on the trips end points checkbox, so that we can hide the end points when
 * the checkbox is unchecked and show them when it's checked
 */
document.querySelector("#endPointsInput").addEventListener('change', (event) => {
	if (event.target.checked) {
		d3.selectAll(".g_circles_end").style("opacity", 1);
	} else {
		d3.selectAll(".g_circles_end").style("opacity", 0);
	}
});