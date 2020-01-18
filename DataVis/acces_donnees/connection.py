import pyodbc
from DataVis.acces_donnees import helper


class Connection:
    def __init__(self):
        self.conn = None

    def connect_(self):
        if self.conn is None:
            try:
                self.conn = pyodbc.connect(helper.cnstr(str('SO10')))
            except pyodbc.Error as e:
                print(e)
        return self.conn
