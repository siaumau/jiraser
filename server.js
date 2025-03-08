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

// 路由：獲取所有活躍的 Sprint
app.get('/api/sprints/active', async (req, res) => {
  try {
    const activeSprints = await jira.getActiveSprints();
    res.json(activeSprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：獲取所有 Sprint
app.get('/api/sprints', async (req, res) => {
  try {
    const allSprints = await jira.getAllSprints();
    res.json(allSprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：獲取指定 Sprint 中的問題
app.get('/api/sprints/:sprintName/issues', async (req, res) => {
  try {
    const { sprintName } = req.params;
    const { projectKey } = req.query;
    const issues = await jira.getIssuesInSprint(sprintName, projectKey);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：獲取特定問題的詳細資訊
app.get('/api/issues/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const issue = await jira.getIssueDetails(issueKey);
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 路由：獲取 Sprint 統計資訊
app.get('/api/sprints/:sprintId/statistics', async (req, res) => {
  try {
    const { sprintId } = req.params;
    const statistics = await jira.getSprintStatistics(sprintId);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 啟動服務器
app.listen(port, () => {
  console.log(`Jira API 服務運行在 http://localhost:${port}`);
});
