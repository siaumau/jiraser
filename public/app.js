document.addEventListener('DOMContentLoaded', () => {
  // 統計資訊切換功能
  const toggleStatsBtn = document.getElementById('toggleStats');
  const statsContainer = document.getElementById('statsContainer');

  if (toggleStatsBtn && statsContainer) {
    toggleStatsBtn.addEventListener('click', () => {
      statsContainer.classList.toggle('visible');
      toggleStatsBtn.classList.toggle('active');
      const isVisible = statsContainer.classList.contains('visible');
      toggleStatsBtn.querySelector('span').textContent = isVisible ? '隱藏統計資訊' : '顯示統計資訊';
    });
  }

  // 自動獲取活躍的 Sprint 並填充下拉選單
  async function loadActiveSprints() {
    const sprintSelect = document.getElementById('sprintName');
    if (!sprintSelect) return;

    try {
      const response = await fetch('/api/sprints/active');
      const data = await response.json();

      if (response.ok) {
        // 清空並重建選項
        sprintSelect.innerHTML = '<option value="">選擇 Sprint</option>';

        // 按照開始日期降序排序（最新的在前面）
        data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        data.forEach(sprint => {
          const option = document.createElement('option');
          option.value = sprint.name;
          const startDate = new Date(sprint.startDate).toLocaleDateString();
          const endDate = new Date(sprint.endDate).toLocaleDateString();
          option.textContent = `${sprint.name} (${startDate} ~ ${endDate})`;
          sprintSelect.appendChild(option);
        });

        // 如果有活躍的 Sprint，自動選擇第一個並觸發載入
        if (data.length > 0) {
          sprintSelect.value = data[0].name;
          // 觸發 Sprint 問題載入
          document.getElementById('getSprintIssues')?.click();
        }
      }
    } catch (error) {
      console.error('載入 Sprint 失敗:', error);
    }
  }

  // 頁面載入時自動獲取活躍的 Sprint
  loadActiveSprints();

  // Sprint 選擇變更時自動載入問題
  const sprintSelect = document.getElementById('sprintName');
  if (sprintSelect) {
    sprintSelect.addEventListener('change', () => {
      document.getElementById('getSprintIssues')?.click();
    });
  }

  // 獲取活躍的 Sprint 按鈕事件
  const getActiveSprintsButton = document.getElementById('getActiveSprints');
  if (getActiveSprintsButton) {
    getActiveSprintsButton.addEventListener('click', async () => {
      const resultElement = document.getElementById('activeSprintsResult');
      if (!resultElement) return;

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
  }

  // 獲取 Sprint 中的問題
  const getSprintIssuesButton = document.getElementById('getSprintIssues');
  if (getSprintIssuesButton) {
    getSprintIssuesButton.addEventListener('click', async () => {
      const sprintName = document.getElementById('sprintName')?.value.trim() || '';
      const projectKey = document.getElementById('projectKey')?.value.trim() || '';
      const assigneeFilter = document.getElementById('assigneeFilter')?.value || '';
      const summaryFilter = document.getElementById('summaryFilter')?.value.trim().toLowerCase() || '';
      const keyFilter = document.getElementById('keyFilter')?.value.trim().toLowerCase() || '';
      const resultElement = document.getElementById('sprintIssuesResult');
      const analysisElement = document.getElementById('analysisResult');

      if (!sprintName || !resultElement) {
        if (resultElement) {
          resultElement.innerHTML = '<div class="error">請輸入 Sprint 名稱</div>';
        }
        if (analysisElement) {
          analysisElement.innerHTML = '';
        }
        return;
      }

      if (resultElement) {
        resultElement.innerHTML = '<div class="loading">載入中...</div>';
      }
      if (analysisElement) {
        analysisElement.innerHTML = '<div class="loading">載入中...</div>';
      }

      try {
        let url = `/api/sprints/${encodeURIComponent(sprintName)}/issues`;
        if (projectKey) {
          url += `?projectKey=${encodeURIComponent(projectKey)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          // 更新負責人下拉選單
          const assigneeSelect = document.getElementById('assigneeFilter');
          if (assigneeSelect) {
            // 收集不重複的負責人列表
            const assignees = [...new Set(data.issues.map(issue => issue.assignee))].sort();

            // 保存當前選中的值
            const currentValue = assigneeSelect.value;

            // 清空並重建選項
            assigneeSelect.innerHTML = '<option value="">所有負責人</option>';
            assignees.forEach(assignee => {
              const option = document.createElement('option');
              option.value = assignee;
              option.textContent = assignee || '未分配';
              assigneeSelect.appendChild(option);
            });

            // 恢復選中的值
            assigneeSelect.value = currentValue;
          }

          // 計算統計資料
          const stats = {
            totalEstimate: 0,
            totalRemaining: 0,
            totalSpent: 0,
            assignees: new Map(),
            statusCounts: new Map()
          };

          data.issues.forEach(issue => {
            // 計算時間
            const estimate = issue.timeEstimate || 0;
            const remaining = issue.timeRemaining || 0;
            const spent = issue.timeSpent || 0;

            stats.totalEstimate += estimate;
            stats.totalRemaining += remaining;
            stats.totalSpent += spent;

            // 統計負責人資料
            if (!stats.assignees.has(issue.assignee)) {
              stats.assignees.set(issue.assignee, {
                total: 0,
                completed: 0,
                remaining: 0,
                issues: []
              });
            }
            const assigneeStats = stats.assignees.get(issue.assignee);
            assigneeStats.total++;
            assigneeStats.issues.push(issue);
            if (issue.status === '完成' || issue.status === 'Done') {
              assigneeStats.completed++;
            } else {
              assigneeStats.remaining++;
            }

            // 統計狀態
            if (!stats.statusCounts.has(issue.status)) {
              stats.statusCounts.set(issue.status, 0);
            }
            stats.statusCounts.set(issue.status, stats.statusCounts.get(issue.status) + 1);
          });

          // 生成統計資料 HTML
          let statsHtml = '<div class="sprint-analysis">';

          // 統計卡片容器
          statsHtml += '<div class="stats-cards">';

          // Sprint 摘要卡片
          statsHtml += `
            <div class="analysis-card summary-card">
              <div class="card-header">
                <h3>Sprint 摘要</h3>
              </div>
              <div class="card-body">
                <div class="summary-item">
                  <span class="label">總計</span>
                  <span class="value">${data.total} 個問題</span>
                </div>
                <div class="summary-item">
                  <span class="label">總預估時間</span>
                  <span class="value">${formatTime(stats.totalEstimate)}</span>
                </div>
                <div class="summary-item">
                  <span class="label">已花費時間</span>
                  <span class="value">${formatTime(stats.totalSpent)}</span>
                </div>
                <div class="summary-item">
                  <span class="label">剩餘時間</span>
                  <span class="value">${formatTime(stats.totalRemaining)}</span>
                </div>
                <div class="summary-item">
                  <span class="label">完成率</span>
                  <span class="value">${calculateCompletionRate(stats.totalSpent, stats.totalEstimate)}%</span>
                </div>
              </div>
            </div>`;

          // 狀態分布卡片
          statsHtml += `
            <div class="analysis-card status-card">
              <div class="card-header">
                <h3>狀態分布</h3>
              </div>
              <div class="card-body">
                <div class="status-grid">`;

          stats.statusCounts.forEach((count, status) => {
            const percentage = ((count / data.total) * 100).toFixed(1);
            statsHtml += `
              <div class="status-item">
                <div class="status-header">
                  <span class="status-label">${status}</span>
                  <span class="status-count">${count}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" style="width: ${percentage}%"></div>
                </div>
                <div class="status-percentage">${percentage}%</div>
              </div>`;
          });

          statsHtml += `
                </div>
              </div>
            </div>`;

          // 團隊成員統計卡片
          statsHtml += `
            <div class="analysis-card team-card">
              <div class="card-header">
                <h3>團隊成員統計</h3>
              </div>
              <div class="card-body">
                <div class="team-grid">`;

          stats.assignees.forEach((memberStats, assignee) => {
            const completionRate = ((memberStats.completed / memberStats.total) * 100).toFixed(1);
            statsHtml += `
              <div class="member-card">
                <div class="member-header">
                  <h4>${assignee || '未分配'}</h4>
                  <div class="completion-rate">${completionRate}%</div>
                </div>
                <div class="member-stats">
                  <div class="stat-row">
                    <span class="stat-label">總任務數</span>
                    <span class="stat-value">${memberStats.total}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">已完成</span>
                    <span class="stat-value completed">${memberStats.completed}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">進行中</span>
                    <span class="stat-value ongoing">${memberStats.remaining}</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div class="progress" style="width: ${completionRate}%"></div>
                </div>
              </div>`;
          });

          statsHtml += `
                </div>
              </div>
            </div>
          </div></div>`;

          // 更新分析結果顯示
          if (analysisElement) {
            analysisElement.innerHTML = statsHtml;
            // 重置統計資訊的顯示狀態
            const statsContainer = document.getElementById('statsContainer');
            const toggleStatsBtn = document.getElementById('toggleStats');
            if (statsContainer && toggleStatsBtn) {
              statsContainer.classList.remove('visible');
              toggleStatsBtn.classList.remove('active');
              toggleStatsBtn.querySelector('span').textContent = '顯示統計資訊';
            }
          }

          // 生成問題列表 HTML
          const itemsPerPage = 10;
          const filteredIssues = data.issues.filter(issue => {
            const matchesAssignee = !assigneeFilter || issue.assignee.toLowerCase().includes(assigneeFilter.toLowerCase());
            const matchesSummary = !summaryFilter || issue.summary.toLowerCase().includes(summaryFilter);
            const matchesKey = !keyFilter || issue.key.toLowerCase().includes(keyFilter);
            return matchesAssignee && matchesSummary && matchesKey;
          });
          const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
          let currentPage = 1;

          function renderIssuesPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageIssues = filteredIssues.slice(start, end);

            let issuesHtml = '<div class="issues-container">';
            issuesHtml += '<h4>卡片列表';
            if (filteredIssues.length !== data.issues.length) {
              issuesHtml += ` (已篩選：${filteredIssues.length}/${data.issues.length})`;
            }
            issuesHtml += '</h4>';
            issuesHtml += '<table><tr><th>金鑰</th><th>摘要</th><th>狀態</th><th>負責人</th><th>預估時間</th><th>已花費</th><th>剩餘</th></tr>';

            pageIssues.forEach(issue => {
              issuesHtml += `<tr>
                <td>${issue.key}</td>
                <td>${issue.summary}</td>
                <td>${issue.status}</td>
                <td>${issue.assignee}</td>
                <td>${formatTime(issue.timeEstimate)}</td>
                <td>${formatTime(issue.timeSpent)}</td>
                <td>${formatTime(issue.timeRemaining)}</td>
              </tr>`;
            });

            issuesHtml += '</table>';

            // 分頁控制
            if (totalPages > 1) {
              issuesHtml += '<div class="pagination">';
              // 上一頁按鈕
              issuesHtml += `<button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">上一頁</button>`;

              // 頁碼按鈕
              for (let i = 1; i <= totalPages; i++) {
                issuesHtml += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
              }

              // 下一頁按鈕
              issuesHtml += `<button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">下一頁</button>`;
              issuesHtml += '</div>';
            }

            issuesHtml += '</div>';

            if (resultElement) {
              resultElement.innerHTML = issuesHtml;
            }
          }

          // 初始渲染第一頁
          renderIssuesPage(1);

          // 添加全局分頁函數
          window.changePage = function(page) {
            if (page >= 1 && page <= totalPages) {
              currentPage = page;
              renderIssuesPage(page);
            }
          };
        } else {
          if (resultElement) {
            resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
          }
          if (analysisElement) {
            analysisElement.innerHTML = '';
          }
        }
      } catch (error) {
        if (resultElement) {
          resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
        }
        if (analysisElement) {
          analysisElement.innerHTML = '';
        }
      }
    });
  }

  // 時間格式化輔助函數
  function formatTime(seconds) {
    if (!seconds) return '0h';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  // 計算完成率
  function calculateCompletionRate(spent, estimate) {
    if (!estimate) return 0;
    return ((spent / estimate) * 100).toFixed(1);
  }

  // 獲取問題詳細資訊
  const getIssueDetailsButton = document.getElementById('getIssueDetails');
  if (getIssueDetailsButton) {
    getIssueDetailsButton.addEventListener('click', async () => {
      const issueKey = document.getElementById('issueKey')?.value.trim() || '';
      const resultElement = document.getElementById('issueDetailsResult');

      if (!issueKey || !resultElement) {
        if (resultElement) {
          resultElement.innerHTML = '<div class="error">請輸入問題金鑰</div>';
        }
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
            html += `<p><strong>描述：</strong></p>`;
            const description = data.description;

            if (description.content) {
              const renderContent = (content) => {
                let contentHtml = '';
                content.forEach(block => {
                  if (block.type === 'paragraph' && block.content) {
                    block.content.forEach(item => {
                      if (item.type === 'text') {
                        let text = item.text;
                        if (item.marks && item.marks.some(mark => mark.type === 'strong')) {
                          text = `<strong>${text}</strong>`;
                        }
                        contentHtml += text;
                      } else if (item.type === 'hardBreak') {
                        contentHtml += '<br>';
                      }
                    });
                    contentHtml += '<br>';
                  } else if (block.type === 'rule') {
                    contentHtml += '<hr>';
                  } else if (block.type === 'bulletList') {
                    contentHtml += '<ul>';
                    block.content.forEach(listItem => {
                      contentHtml += '<li>';
                      if (listItem.content) {
                        contentHtml += renderContent(listItem.content);
                      }
                      contentHtml += '</li>';
                    });
                    contentHtml += '</ul>';
                  } else if (block.type === 'orderedList') {
                    contentHtml += '<ol>';
                    block.content.forEach(listItem => {
                      contentHtml += '<li>';
                      if (listItem.content) {
                        contentHtml += renderContent(listItem.content);
                      }
                      contentHtml += '</li>';
                    });
                    contentHtml += '</ol>';
                  }
                });
                return contentHtml;
              };

              html += renderContent(description.content);
            } else {
              html += `<pre>${JSON.stringify(data.description, null, 2)}</pre>`;
            }
          }

          resultElement.innerHTML = html;
        } else {
          resultElement.innerHTML = `<div class="error">錯誤：${data.error}</div>`;
        }
      } catch (error) {
        resultElement.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
      }
    });
  }
});
