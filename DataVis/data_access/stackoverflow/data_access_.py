from DataVis.data_access.stackoverflow.connection import Connection


class DataAccess:
    """this class is used to separate the connection from our data acces classes"""
    conn = Connection().connect_()

