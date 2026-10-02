# Prompt 5.2 — Founder Pipeline Builder UI

## Context
The Founder dashboard has an "AI Workforce" tab where founders browse, purchase, and execute AI bots. The platform vision includes a **drag-and-drop pipeline builder** where founders visually construct their company's hiring flow and operations by arranging purchased bots into a visual blueprint.

## Objective
Build an interactive drag-and-drop pipeline builder where founders can visually design company workflows by connecting AI bots into processing pipelines. Think of it like a simplified visual programming interface or a flowchart builder.

---

## Task 1: Pipeline Builder Page

Add a new tab to the Founder Dashboard or create a dedicated route:
**Route**: `/dashboard/founder/pipeline-builder`

### 1.1 — Overall Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🔧 PIPELINE BUILDER                    [Save] [Load] [Clear]   │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│  ┌── SIDE PANEL (280px) ─┐  ┌── CANVAS (Remaining Width) ────┐ │
│  │                        │  │                                  │ │
│  │  🔍 Search bots...     │  │                                  │ │
│  │                        │  │     ┌──────┐                     │ │
│  │  ── SCREENING ──       │  │     │ ATS  │                     │ │
│  │  ┌──────────────┐      │  │     │Screener─────┐              │ │
│  │  │ ScoutATS     │      │  │     └──────┘      │              │ │
│  │  │ Resume Screen│      │  │                    ▼              │ │
│  │  │ ⭐⭐⭐⭐       │      │  │              ┌──────┐           │ │
│  │  │ 50 CC/run    │      │  │              │ Hire │           │ │
│  │  └──────────────┘      │  │              │Pulse │           │ │
│  │                        │  │              │Interv├──┐        │ │
│  │  ── INTERVIEW ──       │  │              └──────┘  │        │ │
│  │  ┌──────────────┐      │  │                        ▼        │ │
│  │  │ HirePulse    │      │  │                   ┌──────┐     │ │
│  │  │ Tech Interv. │      │  │                   │ Code │     │ │
│  │  │ ⭐⭐⭐⭐⭐      │      │  │                   │Sentinl│     │ │
│  │  │ 80 CC/run    │      │  │                   └──────┘     │ │
│  │  └──────────────┘      │  │                                  │ │
│  │                        │  │                                  │ │
│  │  ── CODE REVIEW ──     │  │                                  │ │
│  │  ┌──────────────┐      │  │                                  │ │
│  │  │ CodeSentinel │      │  │                                  │ │
│  │  │ PR Reviewer  │      │  │                                  │ │
│  │  │ ⭐⭐⭐⭐        │      │  │                                  │ │
│  │  │ 60 CC/run    │      │  │                                  │ │
│  │  └──────────────┘      │  │                                  │ │
│  │                        │  │                                  │ │
│  │  ── GROWTH ──          │  │                                  │ │
│  │  ┌──────────────┐      │  │                                  │ │
│  │  │ GrowthPilot  │      │  │                                  │ │
│  │  │ Campaigns    │      │  │                                  │ │
│  │  └──────────────┘      │  │                                  │ │
│  │                        │  │                                  │ │
│  │  ── SUPPORT ──         │  │                                  │ │
│  │  ┌──────────────┐      │  │                                  │ │
│  │  │ OpsZen       │      │  │                                  │ │
│  │  │ Ticket Triage│      │  │                                  │ │
│  │  └──────────────┘      │  │                                  │ │
│  └────────────────────────┘  └──────────────────────────────────┘ │
│                                                                   │
│  ┌── PIPELINE SUMMARY ─────────────────────────────────────────┐ │
│  │  Nodes: 3  │  Connections: 2  │  Est. Cost: 190 CC/run      │ │
│  │  Pipeline Type: Hiring Flow                                  │ │
│  │  [TEST PIPELINE]                    [DEPLOY PIPELINE]        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Task 2: Drag-and-Drop Implementation

### 2.1 — Technology Choice
Use **native HTML5 Drag and Drop API** with React state management. No heavy external libraries (keep bundle small). If complexity demands it, consider `@dnd-kit/core` (lightweight) but prefer vanilla implementation.

### 2.2 — Side Panel (Bot Palette)
**Create**: `frontend/src/components/pipeline/BotPalette.jsx`

- Lists purchased bots grouped by category (Screening, Interview, Code Review, Growth, Support)
- Search/filter functionality
- Each bot card shows: name, description snippet, capability stars, cost per run
- Bot cards are draggable (`draggable="true"`)
- Category accordion sections
- Bot cards that aren't purchased are shown grayed out with "Purchase in Marketplace" link

### 2.3 — Canvas (Pipeline Board)
**Create**: `frontend/src/components/pipeline/PipelineCanvas.jsx`

- Receives dropped bot nodes
- SVG or Canvas-based connection lines between nodes
- Grid-snapping for dropped nodes (align to 80px grid)
- Zoom controls (zoom in, zoom out, fit to screen)
- Pan with middle-mouse or space+drag

### 2.4 — Pipeline Node
**Create**: `frontend/src/components/pipeline/PipelineNode.jsx`

Each node on the canvas:
```
┌────────────────────────┐
│ ⊕ ScoutATS            │
│ Resume Screening       │
│ ⭐⭐⭐⭐ | 50 CC/run      │
│                        │
│ Input: ○               │  ← Connection point (left)
│ Output: ○              │  ← Connection point (right)
│                        │
│ [Config ⚙] [Remove ✕] │
└────────────────────────┘
```

Features:
- Draggable within canvas (repositioning)
- Input/output connection points (circles on left/right edges)
- Click connection point → click another node's input → creates connection line
- Double-click or config button → opens node config modal
- Remove button deletes the node and its connections
- Color-coded border by category

### 2.5 — Connection Lines
**Create**: `frontend/src/components/pipeline/ConnectionLine.jsx`

- SVG bezier curves connecting output → input
- Animated dash pattern showing data flow direction
- Click on line to select → press Delete to remove
- Arrow indicator at the target end
- Color matches source node category

### 2.6 — Drag-and-Drop State Management
```javascript
const [nodes, setNodes] = useState([]);       // { id, botId, x, y, config }
const [connections, setConnections] = useState([]);  // { id, sourceNodeId, targetNodeId }
const [selectedNode, setSelectedNode] = useState(null);
const [connecting, setConnecting] = useState(null);   // { sourceNodeId }
const [zoom, setZoom] = useState(1);
const [pan, setPan] = useState({ x: 0, y: 0 });
```

---

## Task 3: Pipeline Data Model

### 3.1 — Backend Model
**Create**: `backend/src/models/Pipeline.js`

```javascript
const pipelineSchema = new mongoose.Schema({
  company: { type: ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['hiring', 'operations', 'growth', 'support', 'custom'],
    default: 'custom',
  },
  nodes: [{
    nodeId: String,
    bot: { type: ObjectId, ref: 'AIBot' },
    position: { x: Number, y: Number },
    config: mongoose.Schema.Types.Mixed,  // Node-specific configuration
  }],
  connections: [{
    connectionId: String,
    sourceNodeId: String,
    targetNodeId: String,
  }],
  status: {
    type: String,
    enum: ['draft', 'deployed', 'paused'],
    default: 'draft',
  },
  estimatedCostPerRun: Number,  // Total CorpCoins per full pipeline execution
  totalRuns: { type: Number, default: 0 },
}, { timestamps: true });

pipelineSchema.index({ company: 1 });
```

### 3.2 — Pipeline API Endpoints
**File**: `backend/src/routes/pipeline.routes.js`

```javascript
router.get('/', requireAuth, requireFounderOrAdmin, controller.getMyPipelines);
router.post('/', requireAuth, requireFounderOrAdmin, controller.savePipeline);
router.put('/:id', requireAuth, requireFounderOrAdmin, controller.updatePipeline);
router.delete('/:id', requireAuth, requireFounderOrAdmin, controller.deletePipeline);
router.post('/:id/deploy', requireAuth, requireFounderOrAdmin, controller.deployPipeline);
router.post('/:id/test', requireAuth, requireFounderOrAdmin, controller.testPipeline);
```

---

## Task 4: Pipeline Execution Engine

### 4.1 — Sequential Execution
When a pipeline is executed (either test or production):
```javascript
async executePipeline(pipelineId, inputData) {
  const pipeline = await Pipeline.findById(pipelineId).populate('nodes.bot');
  
  // Topologically sort nodes based on connections
  const executionOrder = this.topologicalSort(pipeline.nodes, pipeline.connections);
  
  let currentData = inputData;
  const results = [];
  
  for (const node of executionOrder) {
    const bot = node.bot;
    
    // Execute bot pipeline
    const result = await aiService.runPipeline({
      pipelineType: bot.pipelineType,
      input: { ...currentData, ...node.config },
      botId: bot._id,
    });
    
    results.push({ nodeId: node.nodeId, botName: bot.name, output: result });
    
    // Pass output as input to next node
    currentData = { ...currentData, previousStageOutput: result };
    
    // Deduct run cost
    await this.deductRunCost(pipeline.company, bot.pricing.pricePerRun);
  }
  
  pipeline.totalRuns += 1;
  await pipeline.save();
  
  return { pipelineId, results, totalCost: executionOrder.reduce((sum, n) => sum + n.bot.pricing.pricePerRun, 0) };
}
```

---

## Task 5: Pipeline Builder UX Polish

### 5.1 — Node Configuration Modal
When double-clicking a node:
```
┌─────────────────────────────────────────┐
│  ⚙ CONFIGURE: ScoutATS                 │
│                                          │
│  Custom System Prompt:                   │
│  ┌──────────────────────────────────┐   │
│  │ Focus on React and TypeScript    │   │
│  │ experience for this screening... │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Min Score Threshold: [60]               │
│  Pass Action: [Continue to next ▼]       │
│  Fail Action: [Reject with feedback ▼]   │
│                                          │
│  [CANCEL]              [SAVE CONFIG]     │
└─────────────────────────────────────────┘
```

### 5.2 — Pipeline Templates
Pre-built pipeline templates founders can load:
- **Standard Hiring Flow**: ATS Screen → Interview → Code Review
- **Fast Track Hiring**: ATS Screen → Interview (skip code review)
- **Growth Pipeline**: Growth Campaign → Support Ops
- **Full Stack Hiring**: ATS → Interview → Code Review → Growth Campaign (welcome pack)

### 5.3 — Pipeline Cost Calculator
Real-time cost estimation in the summary bar:
```javascript
const estimatedCost = nodes.reduce((total, node) => {
  const bot = purchasedBots.find(b => b._id === node.botId);
  return total + (bot?.pricing?.pricePerRun || 0);
}, 0);
```

---

## Acceptance Criteria
- [ ] Side panel shows purchased bots grouped by category
- [ ] Bots can be dragged from palette onto canvas
- [ ] Nodes snap to grid on drop
- [ ] Nodes can be repositioned within canvas
- [ ] Connection lines can be drawn between node output → node input
- [ ] Connection lines are SVG bezier curves with directional arrows
- [ ] Nodes can be configured (custom prompts, thresholds)
- [ ] Nodes and connections can be deleted
- [ ] Pipeline can be saved to backend
- [ ] Pipeline can be loaded from backend
- [ ] Pipeline templates can be loaded
- [ ] Cost estimation updates in real-time
- [ ] "Test Pipeline" runs all nodes in sequence with test data
- [ ] "Deploy Pipeline" marks pipeline as active
- [ ] Canvas supports zoom and pan
- [ ] Retro arcade theme with grid lines on canvas
- [ ] Mobile: show "Pipeline Builder requires desktop" message
