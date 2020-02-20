/** This function is used to fetch data from a url so we can use it in our visualizations. */
async function get_data_from_DB(){
    let response = await fetch('/SO10/data');
    let data = await response.json()
        .then(json => {
            return json;
        }).catch(err => console.error(err));
    return await data;
}
/**
 * this class os used to fetch data and make sure that we fetch it only once for the sake of productivity (somewhat like the singleton)
 */
class Connection{
    static temp = null;
    constructor(){
        this.data = get_data_from_DB();
    } 

    static instance(){
        if(this.temp == null)
            this.temp = new Connection().data;
        return this.temp;
    }
}