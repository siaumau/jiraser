const JiraApi = require('./jiraApi');

// 創建 Jira API 實例
const jira = new JiraApi();

// 定義一個非同步的主函數
async function main() {
  try {
    // 1. 獲取所有活躍的 Sprint
    console.log('===== 獲取所有活躍的 Sprint =====');
    const activeSprints = await jira.getActiveSprints();
    console.log(JSON.stringify(activeSprints, null, 2));
    console.log('\n');

    // 如果有活躍的 Sprint，使用第一個進行後續操作
    if (activeSprints.length > 0) {
      const currentSprint = activeSprints[0];

      // 2. 獲取當前 Sprint 中的問題
      console.log(`===== 獲取 ${currentSprint.name} 中的問題 =====`);
      const sprintIssues = await jira.getIssuesInSprint(currentSprint.name);
      console.log(JSON.stringify(sprintIssues, null, 2));
      console.log('\n');

      // 3. 如果有問題，獲取第一個問題的詳細資訊
      if (sprintIssues.issues.length > 0) {
        const firstIssue = sprintIssues.issues[0];
        console.log(`===== 獲取問題 ${firstIssue.key} 的詳細資訊 =====`);
        const issueDetails = await jira.getIssueDetails(firstIssue.key);
        console.log(JSON.stringify(issueDetails, null, 2));
        console.log('\n');
      }

      // 4. 獲取 Sprint 統計資訊
      console.log(`===== 獲取 ${currentSprint.name} 的統計資訊 =====`);
      const sprintStats = await jira.getSprintStatistics(currentSprint.id);
      console.log(JSON.stringify(sprintStats, null, 2));
    } else {
      console.log('沒有找到活躍的 Sprint');
    }
  } catch (error) {
    console.error('執行過程中出錯:', error.message);
  }
}

// 執行主函數
main();
