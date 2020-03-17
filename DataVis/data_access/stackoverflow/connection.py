import pyodbc
from DataVis.data_access.utils.helper import Helper


class Connection:
    def __init__(self):
        self.conn = None

    def connect_(self):
        """using the package pyodbc we connect to the database via the connection string"""
        # this extra if makes sure that only one instance gets created by this class
        if self.conn is None:
            try:
                self.conn = pyodbc.connect(Helper.cnstr(str('SO10')))
            except pyodbc.Error as e:
                print(e)
        return self.conn
