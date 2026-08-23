import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import multer from "multer";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoint
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  app.post('/api/upload', upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      const fileKey = `images/${Date.now()}-${req.file.originalname}`;
      const result = await storagePut(fileKey, req.file.buffer, req.file.mimetype);
      
      res.json({ url: result.url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
  
  // Extract product data from URL
  app.post('/api/extract-product', async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL' });
      }
      
      // Use the LLM to extract product information from the URL
      const { invokeLLM } = await import('./llm');
      
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a product data extraction assistant. Extract product information from web pages. Return ONLY a JSON object with fields: title (string), description (string). If you cannot access the URL or extract data, return null for those fields.'
          },
          {
            role: 'user',
            content: `Extract product information from this URL: ${url}\n\nReturn only valid JSON, no markdown formatting.`
          }
        ]
      });
      
      const content = response.choices[0]?.message?.content;
      const contentStr = typeof content === 'string' ? content : '';
      
      // Parse the JSON response
      let productData = null;
      try {
        // Try to extract JSON from the response
        const jsonMatch = contentStr.match(/\{[^{}]*\}/);
        if (jsonMatch) {
          productData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse product data:', e);
      }
      
      if (!productData) {
        return res.status(400).json({ error: 'Could not extract product data from URL' });
      }
      
      res.json(productData);
    } catch (error) {
      console.error('Extract product error:', error);
      res.status(500).json({ error: 'Failed to extract product data' });
    }
  });

  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
