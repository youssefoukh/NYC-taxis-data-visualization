from DataVis.acces_donnees.connection import Connection


class AccesDonnees:
    """this class used to get the connection and separate the connection from our classes that map the tables"""
    conn = Connection().connect_()

