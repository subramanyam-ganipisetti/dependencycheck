import { FileInputItem } from '../types';

export const DEMO_PACKAGE_JSON = JSON.stringify(
  {
    name: "cloud-nexus-api",
    version: "2.4.0",
    description: "Production microservices gateway with auth, redis cache, and data transformations",
    main: "src/server.ts",
    scripts: {
      "start": "ts-node src/server.ts",
      "test": "jest",
      "lint": "eslint src --ext .ts"
    },
    dependencies: {
      "jsonwebtoken": "8.5.1",
      "lodash": "4.17.15",
      "axios": "0.21.1",
      "redis": "3.1.1",
      "minimist": "1.2.5",
      "semver": "7.3.5",
      "dotenv": "16.0.3"
    },
    devDependencies: {
      "@types/node": "^18.11.0",
      "typescript": "^4.9.4"
    }
  },
  null,
  2
);

export const DEMO_PACKAGE_LOCK_JSON = JSON.stringify(
  {
    name: "cloud-nexus-api",
    version: "2.4.0",
    lockfileVersion: 3,
    requires: true,
    packages: {
      "": {
        name: "cloud-nexus-api",
        version: "2.4.0",
        dependencies: {
          "jsonwebtoken": "8.5.1",
          "lodash": "4.17.15",
          "axios": "0.21.1",
          "redis": "3.1.1",
          "minimist": "1.2.5",
          "semver": "7.3.5",
          "dotenv": "16.0.3"
        }
      },
      "node_modules/jsonwebtoken": {
        version: "8.5.1",
        resolved: "https://registry.npmjs.org/jsonwebtoken/-/jsonwebtoken-8.5.1.tgz",
        integrity: "sha512-xBhTxAGUWBZFiA983gkPXNTZTrKK0tu30tVqecM90Uqq3LMLUgtSv05h88e2G654g87f=",
        dependencies: {
          "jws": "^3.2.2",
          "lodash.includes": "^4.3.0",
          "ms": "^2.1.1"
        }
      },
      "node_modules/lodash": {
        version: "4.17.15",
        resolved: "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",
        integrity: "sha512-8xOcRHvCjnocdS5cpwXQXVzcnhFi8KExRcLhKJRh5VyHojltfY3405zp4KLfPhUW55HW4hXDQoj530VWZ9UCmg=="
      },
      "node_modules/axios": {
        version: "0.21.1",
        resolved: "https://registry.npmjs.org/axios/-/axios-0.21.1.tgz",
        integrity: "sha512-dKMY8854jF3Y5X3XwN3tVq+N+B1b4qM5H8e8XN3m2f9Xk=="
      },
      "node_modules/redis": {
        version: "3.1.1",
        resolved: "https://registry.npmjs.org/redis/-/redis-3.1.1.tgz",
        integrity: "sha512-Y30qRk9dZ7r65VbYw2bE1Qd9r3T977y072="
      },
      "node_modules/minimist": {
        version: "1.2.5",
        resolved: "https://registry.npmjs.org/minimist/-/minimist-1.2.5.tgz",
        integrity: "sha512-FM9nNUYrRBAELZQT3xeZQ7fmMOBg6nWNmJKTcgsJDe8dtTQTXWLO942TL264cL5T012G8iWF7AEaFh4fwmV7UA=="
      },
      "node_modules/semver": {
        version: "7.3.5",
        resolved: "https://registry.npmjs.org/semver/-/semver-7.3.5.tgz",
        integrity: "sha512-PoeGJYh8HK4BTO/a9Tf6ZG3veo/A7ZVsYrSA6J8ny9nb3B1VrpkuN+z9bg50Ku5n74W09VM018WuJSK7DE64QQ=="
      },
      "node_modules/dotenv": {
        version: "16.0.3",
        resolved: "https://registry.npmjs.org/dotenv/-/dotenv-16.0.3.tgz",
        integrity: "sha512-7GO6FGHndZOY+gCR1r9k8V/6="
      }
    }
  },
  null,
  2
);

export const DEMO_SOURCE_FILES: FileInputItem[] = [
  {
    path: "src/server.ts",
    content: `import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import cacheService from './services/cache';
import dataRouter from './routes/data';

dotenv.config();

const app = express();
app.use(express.json());

// Main HTTP routes
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`[Gateway] Server active on port \${PORT}\`);
});
`
  },
  {
    path: "src/routes/auth.ts",
    content: `import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getSecretKey } from '../config/secrets';

const router = Router();

// Authenticate session endpoint
router.post('/verify-token', (req: Request, res: Response) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    // VULNERABLE FUNCTION EXECUTION:
    // jsonwebtoken.verify() is directly reachable here via client payload
    const decoded = jwt.verify(token, getSecretKey());
    return res.json({ status: 'valid', payload: decoded });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;
`
  },
  {
    path: "src/routes/data.ts",
    content: `import { Router, Request, Response } from 'express';
import _ from 'lodash';
import { fetchExternalTelemetry } from '../services/httpClient';

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  const rawData = await fetchExternalTelemetry();
  
  // Safe lodash method invocation:
  // Note: _.template() or vulnerable methods are NOT used here.
  const sanitized = _.pick(rawData, ['id', 'status', 'timestamp']);
  
  res.json({ success: true, data: sanitized });
});

export default router;
`
  },
  {
    path: "src/services/httpClient.ts",
    content: `import axios from 'axios';

// HTTP client utility service
export async function fetchExternalTelemetry() {
  // Safe axios invocation: only using axios.get with simple URL
  // Does NOT invoke followRedirects or cross-origin credential passing
  const response = await axios.get('https://api.internal.service/health');
  return response.data;
}
`
  },
  {
    path: "src/services/cache.ts",
    content: `import redis from 'redis';

// Legacy Redis v3 client initialization
// Notice this relies on callback style: client.send_command
const client = redis.createClient({ host: '127.0.0.1', port: 6379 });

export function storeSession(key: string, value: string, cb: Function) {
  // Legacy callback-based command: breaks if upgraded to redis v4 without refactor
  client.send_command('SET', [key, value], (err, reply) => {
    cb(err, reply);
  });
}

export default client;
`
  },
  {
    path: "src/config/secrets.ts",
    content: `export function getSecretKey(): string {
  return process.env.JWT_SECRET || 'super-secret-production-key-99';
}
`
  }
];
