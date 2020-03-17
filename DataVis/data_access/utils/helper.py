from lxml import etree
import os


class Helper:
    """
    This our Helper class to getting all sorts of utilities from connection string to map tokens so we can
    use them for our data vizs
    """
    @staticmethod
    def cnstr(name):
        '''This simply gets connection strings from our xml file config.xml'''
        #setting up a relative path to the config.xml
        dir = os.path.dirname(__file__)
        filename = os.path.join(dir, '../../../config.xml')
        tree = etree.parse(filename)
        return tree.xpath("/configuration/connectionStrings/add[@name='%s']" % name)[0].text

    @staticmethod
    def token(name):
        '''This simply gets token (usually map tokens) strings from our xml file config.xml'''
        #setting up a relative path to the config.xml
        dir = os.path.dirname(__file__)
        filename = os.path.join(dir, '../../../config.xml')
        tree = etree.parse(filename)
        return tree.xpath("/configuration/tokens/add[@name='%s']" % name)[0].text
