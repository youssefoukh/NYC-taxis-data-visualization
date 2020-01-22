import pyodbc
from DataVis.acces_donnees import helper


class Connection:
    def __init__(self):
        self.conn = None

    def connect_(self):
        """using the package pyodbc we connect to the database via the connection string"""
        # this extra if makes sure this is the first connection made (singleton pattern)
        if self.conn is None:
            try:
                self.conn = pyodbc.connect(helper.cnstr(str('SO10')))
            except pyodbc.Error as e:
                print(e)
        return self.conn
