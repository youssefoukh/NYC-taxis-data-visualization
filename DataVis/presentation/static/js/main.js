/** This function is used to fetch data from a url so we can use it in our visualizations. */
async function get_data(){
    let response = await fetch('/SO10/data');
    let data = await response.json();
    return data;
}

/**
* After the data is loaded we will return through this function, we might also use this to launch all
* functions needed for our visualizations.
*/
function setup(){
    get_data().then(json => {
        console.log(json);
        return json;
    }).catch(err => console.error(err));
}

window.addEventListener("load", setup());

