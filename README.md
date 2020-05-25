Steps to start repository:
1) Run `npm install`
2) Add .env file to root folder of repository
3) Inside .env, add the following environment variables:
    - TYPEORM_HOST: url of postgres db instance
    - TYPEORM_PORT: port to hit postgres instance on
    - TYPEORM_USERNAME: username for postgres db login
    - TYPEORM_PASSWORD: password for postgres db login
    - TYPEORM_DATABASE: name of postgres db
    - SENDGRID_API_KEY: API key for the sendgrid API
4) Run `npm run start_local` to start server in localhost
