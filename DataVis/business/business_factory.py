from DataVis.business.user import User
from DataVis.data_access.data_access_user import DataAccessUser


class BusinessFactory:
    """this class will be used to return Business logic object (Factory method pattern)"""
    @staticmethod
    def get_business_user():
        """injection of a DAO class to the User class"""
        return User(DataAccessUser())
