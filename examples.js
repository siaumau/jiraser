const JiraApi = require('./jiraApi');

// 創建 Jira API 實例
const jira = new JiraApi();

// 範例 1: 獲取指定 Sprint 的所有問題並按狀態分組
async function getIssuesByStatus(sprintName) {
  try {
    const result = await jira.getIssuesInSprint(sprintName);

    // 按狀態分組
    const issuesByStatus = {};
    result.issues.forEach(issue => {
      if (!issuesByStatus[issue.status]) {
        issuesByStatus[issue.status] = [];
      }
      issuesByStatus[issue.status].push(issue);
    });

    console.log(`===== ${sprintName} 問題按狀態分組 =====`);
    for (const status in issuesByStatus) {
      console.log(`\n${status} (${issuesByStatus[status].length}):`);
      issuesByStatus[status].forEach(issue => {
        console.log(`  - ${issue.key}: ${issue.summary} (${issue.assignee})`);
      });
    }

    return issuesByStatus;
  } catch (error) {
    console.error('獲取問題並按狀態分組時出錯:', error.message);
    throw error;
  }
}

// 範例 2: 獲取所有活躍 Sprint 的完成進度
async function getSprintsProgress() {
  try {
    const activeSprints = await jira.getActiveSprints();

    console.log('===== 活躍 Sprint 完成進度 =====');
    for (const sprint of activeSprints) {
      const stats = await jira.getSprintStatistics(sprint.id);

      // 計算完成百分比
      const completed = stats.contents.completedIssues.length;
      const total = completed + stats.contents.issuesNotCompletedInCurrentSprint.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      console.log(`\n${sprint.name}:`);
      console.log(`  - 開始日期: ${new Date(sprint.startDate).toLocaleDateString()}`);
      console.log(`  - 結束日期: ${new Date(sprint.endDate).toLocaleDateString()}`);
      console.log(`  - 完成進度: ${percentage}% (${completed}/${total})`);
    }
  } catch (error) {
    console.error('獲取 Sprint 進度時出錯:', error.message);
    throw error;
  }
}

// 範例 3: 獲取指定用戶的所有問題
async function getUserIssues(username, sprintName) {
  try {
    const result = await jira.getIssuesInSprint(sprintName);

    // 過濾指定用戶的問題
    const userIssues = result.issues.filter(issue =>
      issue.assignee.toLowerCase().includes(username.toLowerCase())
    );

    console.log(`\n===== ${username} 在 ${sprintName} 中的問題 =====`);
    userIssues.forEach(issue => {
      console.log(`  - ${issue.key}: ${issue.summary} (${issue.status})`);
    });

    return userIssues;
  } catch (error) {
    console.error(`獲取用戶 ${username} 的問題時出錯:`, error.message);
    throw error;
  }
}

// 執行範例
async function runExamples() {
  try {
    // 獲取活躍的 Sprint
    const activeSprints = await jira.getActiveSprints();

    if (activeSprints.length > 0) {
      const currentSprint = activeSprints[0];

      // 執行範例 1
      await getIssuesByStatus(currentSprint.name);

      // 執行範例 2
      await getSprintsProgress();

      // 執行範例 3 (替換為實際用戶名)
      await getUserIssues('Eric', currentSprint.name);
    } else {
      console.log('沒有找到活躍的 Sprint');
    }
  } catch (error) {
    console.error('執行範例時出錯:', error.message);
  }
}

// 如果直接運行此檔案，則執行範例
if (require.main === module) {
  runExamples();
}

// 導出範例函數，以便在其他檔案中使用
module.exports = {
  getIssuesByStatus,
  getSprintsProgress,
  getUserIssues
};
