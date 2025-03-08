const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const JiraApi = require('./jiraApi');

// 創建 Express 應用
const app = express();
const port = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 創建 Jira API 實例
const jira = new JiraApi();

// API 路由
const apiRouter = express.Router();

// 系統資訊路由
apiRouter.get('/system/domain', (req, res) => {
  const domain = jira.getDomain();
  if (!domain) {
    res.status(500).json({
      error: '未設定 JIRA_DOMAIN 環境變數',
      domain: null
    });
    return;
  }
  res.json({ domain });
});

// Sprint 相關路由
apiRouter.get('/sprints/active', async (req, res) => {
  try {
    const activeSprints = await jira.getActiveSprints();
    res.json(activeSprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/sprints', async (req, res) => {
  try {
    const allSprints = await jira.getAllSprints();
    res.json(allSprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/sprints/:sprintName/issues', async (req, res) => {
  try {
    const { sprintName } = req.params;
    const { projectKey } = req.query;
    const issues = await jira.getIssuesInSprint(sprintName, projectKey);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/sprints/:sprintId/statistics', async (req, res) => {
  try {
    const { sprintId } = req.params;
    const statistics = await jira.getSprintStatistics(sprintId);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue 相關路由
apiRouter.get('/issues/assignee/:assignee', async (req, res) => {
  try {
    const assignee = decodeURIComponent(req.params.assignee);
    const data = await jira.getIssuesByAssignee(assignee);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/issues/:issueKey', async (req, res) => {
  try {
    const data = await jira.getIssueDetails(req.params.issueKey);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 註冊 API 路由
app.use('/api', apiRouter);

// 啟動服務器
app.listen(port, () => {
  console.log(`Jira API 服務運行在 http://localhost:${port}`);
});
