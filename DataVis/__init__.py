from flask import Flask

app = Flask(__name__, template_folder="presentation/templates", static_folder="presentation/static")
# this import was switched here to avoid import loops
from DataVis import urls
