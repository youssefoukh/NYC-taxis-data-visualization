from DataVis.acces_donnees.acces_donnees_ import AccesDonnees


class AccesDonneesUser(AccesDonnees):
    """this class server to getting data and processing data from the table Users that belong to the stackoverflow db"""

    def get_all(self):
        cursor = self.conn.cursor()
        cursor.execute('SELECT TOP 500 * FROM dbo.Users')
        return cursor.fetchall()

    def get_user(self, id):
        cursor = self.conn.cursor()
        cursor.execute('select * from Users u where u.Id = ?', id)
        return cursor.fetchone()

    def get_vote_year(self):
        """this function return a the data for a user and the total votes of each post he did """
        cursor = self.conn.cursor()
        cursor.execute('select * from user_post')
        return cursor.fetchall()
