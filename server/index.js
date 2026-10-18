import { createApp } from './app.js';
import { createMailer } from './mailer.js';

const port = Number(process.env.PORT || 3001);
const app = createApp({
  mailer: await createMailer(),
  ...(process.env.DATA_FILE && { dataFile: process.env.DATA_FILE }),
  rateLimit: { max: Number(process.env.RATE_LIMIT_MAX || 5), windowMs: 60_000 },
});
app.listen(port, () => console.log(`Portfolio running on http://localhost:${port}`));
