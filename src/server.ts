import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { RedditNotifierRoutes } from './routes';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typedi';
import { DailyEmailJob } from './jobs/daily-email.job';

// Load Environment Variables from from .env file
require('dotenv').config();

const initializeAndStartApplication = async () => {
  useContainer(Container); // Allows typedi access into typeorm

  // Initialize connection to the pg database
  // Note, this connects to pg database running locally
  // Convert to external pg in order to deploy application
  // These connections should be moved to environment variables,
  //       as to not expose connection information
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: true,
    entities: ['src/entities/**/*.entity.ts'],
    cli: {
      entitiesDir: 'src/entities',
    },
  });

  // Initialize express
  const app: Express = express();

  app.use(bodyParser.json()); // Parse request body
  app.use(cors({ origin: '*' })); // Allow cors from anywhere for right now

  // Initialize router class with typedi. Will allow us to use depdency injection throughout app
  const redditNotifierRoutes = Container.get(RedditNotifierRoutes);

  // Initialize daily email job
  const dailyEmailJob = Container.get(DailyEmailJob);
  dailyEmailJob.startConsumer();

  // Include all public routes. Private routes would need to undergo
  //     authentication and token parsing middleware
  app.use('/', await redditNotifierRoutes.fetchPublicRoutes());

  await app.listen({ port: 5000 });

  console.log('App is awaiting requests on port 5000');
};

// Start application
initializeAndStartApplication();
