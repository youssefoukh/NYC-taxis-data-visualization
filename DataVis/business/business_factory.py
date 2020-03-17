from DataVis.business.stackoverflow.user import User
from DataVis.business.taxi.taxi import Taxi
from DataVis.data_access.stackoverflow.data_access_user import DataAccessUser
from DataVis.data_access.taxi.data_access_taxis import DataAccessTaxis


class BusinessFactory:
    """this class will be used to return Business logic object (Factory method pattern)"""

    @staticmethod
    def get_business_user():
        """injection of a DAO class to the User class"""
        return User(DataAccessUser())

    @staticmethod
    def get_business_taxi():
        return Taxi(DataAccessTaxis())
