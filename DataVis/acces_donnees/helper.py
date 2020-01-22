from lxml import etree


def cnstr(name):
    # this simply gets connection strings from our xml file config.xml
    tree = etree.parse("config.xml")
    return tree.xpath("/configuration/connectionStrings/add[@name='%s']" % name)[0].text
