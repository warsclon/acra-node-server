 ACRA Node Server (v. 0.0.4)
================

Server [ACRA](http://acra.ch/) for [Node.js](http://nodejs.org/) with data base [Mongodb](http://www.mongodb.org/)

Save all the crash reports in your own server.

### version 0.0.4
* Updated to work with Express 4.x
* Updated to work with newer MongoDB


### version 0.0.3
* Statistics by android version.
* Statistics by date error.


### version 0.0.2
* Statistics by mobile.

Technologies Used
------------
Server = [node.js, express, ejs, mongodb, emailjs, node-properties-parser, colors, moment, async]

Client = [bootstrap, jquery, tablesorter, jqplot]

Installation
------------
 1. Download and unzip (or git clone) into a directory.
 2. Run "$ npm install"
 3. Configure /acra_server.properties with mongodb, port web, user and password access and email credentials.
 4. Run app via "$ node appAcra"


Philosophy
------------
 * Build a Server to replace Google Docs.
 * Write using modern tecnologies as Node.js and Mongodb.
 * Simple configuration with a only one properties file.
 * Interface using Bootstrap.

Features
------------
 * Basic front end web pages.
 * Send emails when receive ACRA report.
 * Login system to protect access.
 * Export all reports in json format.
 * Export detail report in json format.
 * Delete report.
 * Multiple applications in the same server.
 * Separate the crash in differents collections by app

## If you have previously version 0.0.2 or 0.0.1

You need to convert the USER_CRASH_DATE from Text to Date format, the solution is execute a script:

modify_db.js

Edit the script:

```
var NAME_COLLECTION = "your_collection";
var DB_URL = "mongodb://127.0.0.1:27017/your_db";
```

And Execute

```
node modify_db.js
```


## How to config ACRA Class in Android

1. Config Acra Class in application with the url of the server

2. Configuration URL in Java Class (http://SERVER:PORT_SERVER/logs/NAME_APP)

 2.1. SERVER (IP or DNS)

 2.2. PORT_SERVER (PORT WEB SERVER) 

 2.3. NAME_APP (NAME APP where will be save all the crash)

 * Example url: http://my_server:port_server/logs/my_app

```Java

import org.acra.*;
import org.acra.annotation.*;
@ReportsCrashes(formUri = "http://SERVER:PORT_SERVER/logs/NAME_APP", formKey="")
public class MyApplication extends Application {
  @Override
  public void onCreate() {
    // The following line triggers the initialization of ACRA
    ACRA.init(this);
    super.onCreate();
  }
}

```

More information about configuration Android application [here](https://github.com/ACRA/acra/wiki/BasicSetup)

## Config acra_server.properties

```
# CONFIGURATION WEB
# Acra web server port 
port_web = 3000
# Web access user
username = john
# Web acess password
password = john
# Cookie config
key = acraserver
secret = b29a25fe160453b475d4243d12yrty342345752eeaa5bc

# CONFIGURATION MONGODB
# port mongodb
mongodb_port = 27017
# Ip mongodb
mongodb_ip = localhost
# Name Data base
name_database = acraloggerdb


# CONFIGURATION MAIL
# yes or no if want send email if acra error recive
send_mail = yes

# config connection email server
user_mail= your_email@gmail.com
password_mail = password_mail_gmail
host =smtp.gmail.com
ssl = true

# config email
subject = Acra Error Server
from = serveracra@acra.ch
# List emails separate with comma example john@gmail,john2@gmail.com
to = john@mycompany.com,elizabeth@mycompany.com

#config date
date_format=YYYY-MM-DD hh:mm:ss
```

## Configuration Mongodb
Automatic configuration:

 * Creation of DB automatic
 * Creation collection automatic
 * Independent collections by App

## Access server
 * http://my_server:port_server (and login)


##Thank you 

Paolo Casarini that made the original implementation:

http://www.casarini.org/blog/2013/acra-nodejs-mongodb/


## License
( The MIT License )

Copyright (c) 2013 Diego Martin Moreno 

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 