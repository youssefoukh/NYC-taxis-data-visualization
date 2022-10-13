## New York City Taxi Trips Visualization
Big Data Visualisation in spacetime using D3
## Prerequisites
First install python the lastest stable version then install the following packages using pip (lastest version of python comes with pip included otherwise you can download it separately)
```
pip install flask
pip install pyodbc
pip install swifter
pip install pandas
pip install geojson
pip install requests
pip install lxml
```
## Running
Just locate yourself in the directory and press run.py or :
```
py run.py
```
Info should pop about the link of the server its usually 127.0.0.1:5000
## Built With (Main)
* [D3](https://d3js.org/) - JavaScript library
* [Flask](http://flask.palletsprojects.com/en/1.1.x/) - The web microframework used
* [Python](https://docs.python.org/3/) - The programming language used
## Authors
* **Youssef Oukhouya** - *Initial work* - [youssefoukhouya](https://github.com/youssefoukhouya)
* **Salman Hamdouchi** - *Initial work* - [SalmanHamdouchi](https://github.com/SalmanHamdouchi)


## Dataset
  The dataset was taken from Illinoi's Data Bank's [New York Taxi Trip Data (2010-2013)](https://databank.illinois.edu/datasets/IDB-9610843)
  and it's stored in CSV format, organized by year and month. In each file, each row represents a single taxi trip.  

  The data is organized as follows:

  * medallion: a permit to operate a yellow taxi cab in New York City, it is effectively a car ID.  
  * hack license: a license to drive the vehicle, it is effectively a driverID.  
  * rate_code: taximeter rate.  
  * store_and_fwd_flag: This flag indicates whether the trip record was held in vehicle memory before sending to the vendor because the vehicle did not have a connection to the server.  
  * pickup datetime: start time of the trip, mm-dd-yyyy hh24:mm:ss EDT.  
  * dropoff datetime: end time of the trip, mm-dd-yyyy hh24:mm:ss EDT.  
  * passenger count: number of passengers on the trip, default value is one.
  * trip time in secs: trip time measured by the taximeter in seconds.  
  * trip distance: trip distance measured by the taximeter in miles.  
  * pickup_longitude and pickup_latitude: GPS coordinates at the start of the trip.  
  * dropoff longitude and dropoff latitude: GPS coordinates at the end of the trip.  

## Visualizing the dataset
* ### Main page  
   The user can select whether to visualize the whole month or just a single day in that month
  ![image](https://user-images.githubusercontent.com/59615719/128273166-e0ef7e11-6726-466c-bec0-c13a9ff39f67.png)

* ### Visualizing the whole month
  ![image](https://user-images.githubusercontent.com/59615719/128273221-9d5c53d9-14c9-43ce-90e0-5e9126dc717c.png)
 This image shows the NYC Taxi trips of the month of august (from day 1 to day 7 at 2pm) alongside the pickup and dropoff locations.  
 There are multiple controls the user can interact with:
  * Settings: the user has the possibility to toggle the visibility of start and end points of trips. As well as, seeing just night-time trips, day-time trips or the whole day trips.
  * Bar chart: it represents the number of trips on each day if the user chose a month, and the number of trips on each hour if the user chose a single day, each bar shows a tooltip indicating the number of trips when it's hovered over.
  * Range slider: it's auto-play by default, after each hour, the trips that took place on that hour get printed on the map. This range slider not only shows a progression of trips over time, but also gives the user the possibility of choosing the range of time the taxi trips took place in. 

* ### Visualizing trips of a single day:
  #### Day-time trips:
  Day-time trips' paths have a green color.
  ![image](https://user-images.githubusercontent.com/59615719/128274685-097759bd-e9f9-4343-baec-83fe574a08ef.png)  

  #### Night-time trips:
  Night-time trips' paths have a blue color.
  ![image](https://user-images.githubusercontent.com/59615719/128274863-d3d55cb2-4f0b-4513-853d-028cce873383.png)



