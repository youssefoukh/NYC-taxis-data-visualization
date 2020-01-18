from lxml import etree


def cnstr(name):
    tree = etree.parse("config.xml")
    return tree.xpath("/configuration/connectionStrings/add[@name='%s']" % name)[0].text
