import pyodbc

from DataVis.data_access.stackoverflow.data_access_ import DataAccess


class DataAccessUser(DataAccess):
    """this class serves to getting and processing data from the table Users that belong to the stackoverflow db"""

    def get_all(self):
        """gets the top 500 users from the stackoverflow database"""
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT TOP 500 * FROM dbo.Users')
        except pyodbc.Error as err:
            print('Error !!!!! %s' % err)
        return cursor.fetchall()

    def get_user(self, id):
        """gets info about a user via the parameter passed that is the id of the user"""
        cursor = self.conn.cursor()
        try:
            cursor.execute('select * from Users u where u.Id = ?', id)
        except pyodbc.Error as err:
            print('Error !!!!! %s' % err)
        return cursor.fetchone()

    def get_posts(self, id):
        """this function return the total posts of a given user """
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT p.Id,p.CreationDate FROM Posts p where p.OwnerUserId=? ORDER BY p.CreationDate;', id)
        except pyodbc.Error as err:
            print('Error !!!!! %s' % err)
        return cursor.fetchall()

    def get_votes(self, post_id):
        """this function receives a post id as parameter and return all the votes of that post"""
        cursor = self.conn.cursor()
        try:
            cursor.execute('SELECT vt.Id FROM Votes v,VoteTypes vt where v.VoteTypeId=vt.Id and v.PostId=?;', post_id)
        except pyodbc.Error as err:
            print('Error !!!!! %s' % err)
        return cursor.fetchall()
