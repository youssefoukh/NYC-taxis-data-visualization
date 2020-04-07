import pandas as pd
import os


class DataAccessTaxis:
    '''This class will be used to do all sort of treatments on our taxi dataset (format : csv)'''

    def __init__(self):
        ''' Class constructor '''
        # setting up a relative path to the csv file
        dir = os.path.dirname(__file__)
        filename = os.path.join(dir, '../data/sample.csv')
        # read from csv file
        self.df = pd.read_csv(filename,
                              sep=',',
                              usecols=['pickup_longitude', 'pickup_latitude', 'dropoff_datetime', 'trip_distance',
                                       'passenger_count', 'trip_time_in_secs', 'pickup_datetime', 'dropoff_longitude',
                                       'dropoff_latitude'])
        # Sorting our data by pickup datetime
        self.df.set_index('pickup_datetime')
        self.clean(self.df)

    def clean(self, df):
        df = df.loc[(df['pickup_longitude'] != 0) | (df['pickup_latitude'] != 0)
                    | (df['dropoff_longitude'] != 0) | (df['dropoff_latitude'] != 0)]
        df.to_csv("../../sample.csv")
