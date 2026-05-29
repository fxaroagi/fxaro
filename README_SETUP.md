# OpenClaw Agent System - Node.js + TypeScript

A multi-agent autonomous system with 7 specialized agents for task automation.

## Quick Start

### 1. Configure Environment Variables

Edit `.env` and add your API keys:
```bash
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
REPLICATE_API_KEY=your_key_here
TELEGRAM_BOT_TOKEN=your_token_here
```

### 2. Build the Project
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
```

Server will start on port 3000 (configurable via `PORT` in .env).

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Execute Task
```bash
POST /api/tasks
{
  "agentType": "task-planner",
  "input": "Your task description",
  "userId": "optional_user_id"
}
```

### Batch Execute
```bash
POST /api/tasks/batch
{
  "tasks": [
    { "agentType": "web-navigator", "input": { "url": "..." } }
  ]
}
```

### Get Task Results
```bash
GET /api/tasks/:taskId/results
```

## 7 Specialized Agents

1. **TaskPlannerAgent** - Breaks down complex tasks into subtasks
2. **WebNavigatorAgent** - Web scraping and page content extraction
3. **DataAnalystAgent** - Data analysis and insights generation
4. **ContentCreatorAgent** - Content generation (articles, blogs, etc.)
5. **CodeExecutorAgent** - Code generation for various languages
6. **MediaGeneratorAgent** - Image and video generation
7. **ResultFormatterAgent** - Output formatting (JSON, Markdown, HTML, CSV, text)

## WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const socket = io('http://localhost:3000');

// Execute task
socket.emit('execute-task', {
  agentType: 'task-planner',
  input: 'Your task'
});

// Listen for results
socket.on('task-completed', (result) => {
  console.log('Task completed:', result);
});
```

## Database

SQLite database stores:
- User accounts
- Task execution history
- Results
- API call logs

## Development

### Build and Run Dev Mode
```bash
npm run dev
```

### View Logs
```bash
tail -f logs/combined.log
```

## Production Deployment

Create systemd service file `/etc/systemd/system/openclaw.service`:
```ini
[Unit]
Description=OpenClaw Agent System
After=network.target

[Service]
Type=simple
User=openclaw
WorkingDirectory=/opt/openclaw
ExecStart=/usr/bin/node /opt/openclaw/dist/server.js
Restart=always
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw
```

## Project Structure

```
src/
  agents/           # 7 specialized agent classes
  orchestrator/     # AgentOrchestrator & ApiRotationManager
  services/         # Database, Logger, etc.
  interfaces/       # Telegram, WhatsApp, Web Dashboard (future)
  middleware/       # Auth, error handling (future)
  config/           # Configuration constants
  server.ts         # Main server entry point
```

## Next Steps

- [ ] Add Telegram bot interface
- [ ] Add WhatsApp integration
- [ ] Add Web Dashboard UI
- [ ] Add authentication middleware
- [ ] Add real-time analytics
- [ ] Add self-learning engine
- [ ] Deploy to production VPS
