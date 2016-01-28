Time Tracking Service
==========================

System Requirements:

- Need to npm install all packages from package.json
    - If permission issue encountered, try with sudo
- Installation of MongoDB
    - See \config\db.js for assumed DB configurations
- Run the server using with command "npm start"
    - See config\server.js for assumed server configurations
    - If permission issue encountered, try with sudo

Deployment: (Work in Progress. Don't use yet!)

- Prerequsite: Install Elastic Beanstalk CLI
    - http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html 
- Execute deployment with command "./deploy.sh"
    - If permission issue is encountered, try updating the ACL on the bash script file. "chmod u+x ./deploy.sh"


