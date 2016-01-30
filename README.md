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

Deployment:

- One time setup
    - Prerequsite: Install Elastic Beanstalk CLI
        - http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html 
    - Config the credentials to use with the EB CLI locally
        - Run commang'eb init'
        - When prompted, enter the 'Access ID' and 'Secret Key' for the time tracking service EB user
- Routine steps
    - Execute deployment with command "./deploy.sh"
        - If permission issue is encountered, try updating the ACL on the bash script file. "chmod u+x ./deploy.sh"
    - The process could take minutes. So be patient.
    - Once the deployment is done, console should show the successful message
        - "The deployment has been completed!"
    - Go to the AWS console and monitor the status of Elastic Beanstalk
    - Hit /livecheck to make sure the service is live

Database:

- We chose to use the hosted MongoDB service provided by MongoLab
    - https://mongolab.com/
- Connection URI. See ./config/db.js
    - For deployment on Elastic Beanstalk, the configuration would automatically pull the URI stored in the envrionment variable.
    - For local development, the configuration would use the default one pointing at local running MongoDb server

Plan for Next Step:

- Deploy to different environments via CLI
    - Create test and production (and optionally, staging) environments in EB for the application
    - Set environment variables for each environment
        - MongoDB URI
    - Setup git branches to match all the environments
    - Setup git branch to environment linkages via EB CLI
- Then, eventually look at EB integration with CircleCI (or any CI options works well with EB and GitHub)
