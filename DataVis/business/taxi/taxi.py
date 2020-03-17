import requests
from geojson import Feature, LineString, FeatureCollection, dump
from DataVis.data_access.utils.helper import Helper
import swifter
import pandas as pd


class Taxi:
    """
    this class is used for treatement of the data we get from the csv file through the DataAccessTaxi class
    """
    def __init__(self, dao):
        #injection of our data access object
        self._dao = dao

    def row_to_geojson(self, features, row):
        """Using the mapbox api and the data of the row passed to the function we transform it to 
        a geojson feature (LineString) and then add it to a list of features
        """
        base_url = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
        url = base_url + str(row['pickup_longitude']) + \
              ',' + str(row['pickup_latitude']) + \
              ';' + str(row['dropoff_longitude']) + \
              ',' + str(row['dropoff_latitude'])
        params = {
            'geometries': 'geojson',
            'access_token': Helper.token(str('mapbox_token'))
        }
        req = requests.get(url, params=params)
        route_json = req.json()['routes'][0]
        features.append(
            Feature(
                geometry=LineString(route_json['geometry']['coordinates']),
                properties={
                    'pickup_datetime': row['pickup_datetime'],
                    'dropoff_datetime': row['dropoff_datetime'],
                    'trip_distance': row['trip_distance'],
                    'passenger_count': row['passenger_count'],
                    'trip_time_in_secs': row['trip_time_in_secs']
                }
            )
        )

    def transform_rows(self):
        """Using lambda expression we call the function above on each row of the dataframe 
        from the data access object"""
        features = []
        self._dao.df.swifter.apply(lambda row: self.row_to_geojson(features, row), axis=1)
        collection = FeatureCollection(features)
        return collection

    def get_data_by_date(self, date):
        """This is function is used to query by date the dataframe from our data access object
         before passing it to transform_rows"""
        self._dao.df = self._dao.df.loc[(pd.to_datetime(self._dao.df['pickup_datetime']).dt.day == pd.to_datetime(date).day)]
        return self.transform_rows()
