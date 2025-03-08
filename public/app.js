document.addEventListener('DOMContentLoaded', () => {
  // 獲取活躍的 Sprint
  document.getElementById('getActiveSprints').addEventListener('click', async () => {
    const resultElement = document.getElementById('activeSprintsResult');
    resultElement.innerHTML = '<div class="loading">載入中...</div>';

    try {
      const response = await fetch('/api/sprints/active');
      const data = await response.json();

      if (response.ok) {
        let html = '<table><tr><th>ID</th><th>名稱</th><th>狀態</th><th>開始日期</th><th>結束日期</th></tr>';

        data.forEach(sprint => {
          const startDate = new Date(sprint.startDate).toLocaleDateString();
          const endDate = new Date(sprint.endDate).toLocaleDateString();

          html += `<tr>
            <td>${sprint.id}</td>
            <td>${sprint.name}</td>
            <td>${sprint.state}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
          </tr>`;
        });

        html += '</table>';
        resultElement.innerHTML = html;
      } else {
        resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
      }
    } catch (error) {
      resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
    }
  });

  // 獲取 Sprint 中的問題
  document.getElementById('getSprintIssues').addEventListener('click', async () => {
    const sprintName = document.getElementById('sprintName').value.trim();
    const projectKey = document.getElementById('projectKey').value.trim();
    const resultElement = document.getElementById('sprintIssuesResult');

    if (!sprintName) {
      resultElement.innerHTML = '<div class="error">請輸入 Sprint 名稱</div>';
      return;
    }

    resultElement.innerHTML = '<div class="loading">載入中...</div>';

    try {
      let url = `/api/sprints/${encodeURIComponent(sprintName)}/issues`;
      if (projectKey) {
        url += `?projectKey=${encodeURIComponent(projectKey)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        let html = `<p>總計：${data.total} 個問題</p>`;
        html += '<table><tr><th>金鑰</th><th>摘要</th><th>狀態</th><th>負責人</th></tr>';

        data.issues.forEach(issue => {
          html += `<tr>
            <td>${issue.key}</td>
            <td>${issue.summary}</td>
            <td>${issue.status}</td>
            <td>${issue.assignee}</td>
          </tr>`;
        });

        html += '</table>';
        resultElement.innerHTML = html;
      } else {
        resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
      }
    } catch (error) {
      resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
    }
  });

  // 獲取問題詳細資訊
  document.getElementById('getIssueDetails').addEventListener('click', async () => {
    const issueKey = document.getElementById('issueKey').value.trim();
    const resultElement = document.getElementById('issueDetailsResult');

    if (!issueKey) {
      resultElement.innerHTML = '<div class="error">請輸入問題金鑰</div>';
      return;
    }

    resultElement.innerHTML = '<div class="loading">載入中...</div>';

    try {
      const response = await fetch(`/api/issues/${encodeURIComponent(issueKey)}`);
      const data = await response.json();

      if (response.ok) {
        let html = `<h3>${data.key}: ${data.summary}</h3>`;
        html += `<p><strong>狀態：</strong> ${data.status}</p>`;
        html += `<p><strong>負責人：</strong> ${data.assignee}</p>`;
        html += `<p><strong>報告者：</strong> ${data.reporter}</p>`;
        html += `<p><strong>優先級：</strong> ${data.priority}</p>`;
        html += `<p><strong>創建時間：</strong> ${new Date(data.created).toLocaleString()}</p>`;
        html += `<p><strong>更新時間：</strong> ${new Date(data.updated).toLocaleString()}</p>`;

        if (data.components && data.components.length > 0) {
          html += `<p><strong>組件：</strong> ${data.components.join(', ')}</p>`;
        }

        if (data.labels && data.labels.length > 0) {
          html += `<p><strong>標籤：</strong> ${data.labels.join(', ')}</p>`;
        }

        if (data.description) {
          html += `<p><strong>描述：</strong></p><pre>${data.description}</pre>`;
        }

        resultElement.innerHTML = html;
      } else {
        resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
      }
    } catch (error) {
      resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
    }
  });

  // 獲取 Sprint 統計資訊
  document.getElementById('getSprintStatistics').addEventListener('click', async () => {
    const sprintId = document.getElementById('sprintId').value.trim();
    const resultElement = document.getElementById('sprintStatisticsResult');

    if (!sprintId) {
      resultElement.innerHTML = '<div class="error">請輸入 Sprint ID</div>';
      return;
    }

    resultElement.innerHTML = '<div class="loading">載入中...</div>';

    try {
      const response = await fetch(`/api/sprints/${encodeURIComponent(sprintId)}/statistics`);
      const data = await response.json();

      if (response.ok) {
        // 計算完成百分比
        const completed = data.contents.completedIssues.length;
        const notCompleted = data.contents.issuesNotCompletedInCurrentSprint.length;
        const total = completed + notCompleted;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        let html = `<h3>${data.sprint.name} 統計資訊</h3>`;
        html += `<p><strong>完成進度：</strong> ${percentage}% (${completed}/${total})</p>`;

        html += '<h4>已完成的問題：</h4>';
        if (completed > 0) {
          html += '<ul>';
          data.contents.completedIssues.forEach(issue => {
            html += `<li>${issue.key}: ${issue.summary}</li>`;
          });
          html += '</ul>';
        } else {
          html += '<p>沒有已完成的問題</p>';
        }

        html += '<h4>未完成的問題：</h4>';
        if (notCompleted > 0) {
          html += '<ul>';
          data.contents.issuesNotCompletedInCurrentSprint.forEach(issue => {
            html += `<li>${issue.key}: ${issue.summary}</li>`;
          });
          html += '</ul>';
        } else {
          html += '<p>沒有未完成的問題</p>';
        }

        resultElement.innerHTML = html;
      } else {
        resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
      }
    } catch (error) {
      resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
    }
  });
});
