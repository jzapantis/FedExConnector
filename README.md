# FedExConnector
This application is the server side code, integrating with a localhost mongoDB database, to process the tracking of FedEx tracking numbers. This application receives input from a google form, then is POSTed to the add endpoint, from there it is processed in this code, and inserted into the DB. Once in the DB, it can be viewed, and each tracking number can be tracked as well by sending it to FedEx tracking servers. 