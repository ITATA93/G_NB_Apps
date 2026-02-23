import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './services/logger';
import { planService } from './services/planService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Trigger plan processing manually
app.post('/api/process-plan', async (req, res) => {
    logger.info('Manual trigger received for plan processing');
    // Run asynchronously to not block response
    planService.processPlan().catch(err => logger.error('Manual process failed:', err));
    res.json({ message: 'Plan processing triggered' });
});

// Start Server
app.listen(port, () => {
    logger.info(`BUHO Backend Service running on port ${port}`);

    // Schedule the plan processing (e.g., every 5 minutes)
    // For now, run once on startup to verify
    setTimeout(() => {
        planService.processPlan();
    }, 5000);

    // Interval: Every 5 minutes
    setInterval(() => {
        planService.processPlan();
    }, 5 * 60 * 1000);
});
