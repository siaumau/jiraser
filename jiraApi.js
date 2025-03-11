require('dotenv').config();
const axios = require('axios');

class JiraApi {
  constructor() {
    this.domain = process.env.JIRA_DOMAIN;
    this.email = process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;
    this.boardId = process.env.JIRA_BOARD_ID;

    console.log('Jira API 配置信息：');
    console.log('Domain:', this.domain);
    console.log('Email:', this.email);
    console.log('Board ID:', this.boardId);
    console.log('API Token 長度:', this.apiToken ? this.apiToken.length : 0);

    if (!this.domain || !this.email || !this.apiToken || !this.boardId) {
      console.error('缺少必要的環境變數配置');
      throw new Error('環境變數配置不完整');
    }

    // 設置 axios 基本配置
    this.axiosInstance = axios.create({
      baseURL: `https://${this.domain}`,
      auth: {
        username: this.email,
        password: this.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // 添加請求攔截器用於調試
    this.axiosInstance.interceptors.request.use(config => {
      console.log(`發送請求到: ${config.baseURL}${config.url}`);
      return config;
    });

    // 添加響應攔截器用於調試
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.error('API 請求失敗:', {
          url: error.config.url,
          method: error.config.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message
        });
        throw error;
      }
    );
  }

  // 獲取 JIRA 網域
  getDomain() {
    return this.domain;
  }

  /**
   * 獲取指定 Sprint 中的問題
   * @param {string} sprintName - Sprint 名稱
   * @param {string} projectKey - 專案金鑰，預設為 TWIT
   * @returns {Promise<Object>} - 包含問題列表的物件
   */
  async getIssuesInSprint(sprintName, projectKey = 'TWIT') {
    try {
      const jql = `sprint = "${sprintName}" AND project = ${projectKey}`;
      const response = await this.axiosInstance.get('/rest/api/3/search', {
        params: {
          jql: jql,
          maxResults: 100
        }
      });

      // 格式化輸出結果
      const issues = response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : '未分配',
        aggregatetimeoriginalestimate: issue.fields.aggregatetimeoriginalestimate,
      }));

      return {
        total: response.data.total,
        issues: issues
      };
    } catch (error) {
      console.error('獲取 Sprint 問題時出錯:', error.message);
      throw error;
    }
  }

  /**
   * 獲取特定問題的詳細資訊
   * @param {string} issueKey - 問題金鑰，例如 TWIT-123
   * @returns {Promise<Object>} - 問題的詳細資訊
   */
  async getIssueDetails(issueKey) {
    try {
      const response = await this.axiosInstance.get('/rest/api/3/issue/' + issueKey);

      const issue = response.data;
      
      // 獲取留言
      const commentsResponse = await this.axiosInstance.get(`/rest/api/3/issue/${issueKey}/comment`);
      console.table(commentsResponse);
      const comments = commentsResponse.data.comments.map(comment => ({
        id: comment.id,
        author: comment.author.displayName,
        created: comment.created,
        updated: comment.updated,
        body: comment.body
      }));

      return {
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee ? issue.fields.assignee.displayName : '未分配',
        reporter: issue.fields.reporter ? issue.fields.reporter.displayName : '未知',
        priority: issue.fields.priority ? issue.fields.priority.name : '未設置',
        created: issue.fields.created,
        updated: issue.fields.updated,
        components: issue.fields.components.map(c => c.name),
        labels: issue.fields.labels,
        comments: comments
      };
    } catch (error) {
      console.error(`獲取問題 ${issueKey} 詳細資訊時出錯:`, error.message);
      throw error;
    }
  }

  /**
   * 獲取所有活躍的 Sprint
   * @returns {Promise<Array>} - 活躍 Sprint 的列表
   */
  async getActiveSprints() {
    try {
      const response = await this.axiosInstance.get(
        '/rest/agile/1.0/board/' + this.boardId + '/sprint?state=active'
      );

      return response.data.values.map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      }));
    } catch (error) {
      console.error('獲取活躍 Sprint 時出錯:', error.message);
      throw error;
    }
  }

  /**
   * 獲取所有 Sprint（包括已完成的）
   * @returns {Promise<Array>} - 所有 Sprint 的列表
   */
  async getAllSprints() {
    try {
      const response = await this.axiosInstance.get(
        '/rest/agile/1.0/board/' + this.boardId + '/sprint'
      );

      return response.data.values.map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      }));
    } catch (error) {
      console.error('獲取所有 Sprint 時出錯:', error.message);
      throw error;
    }
  }

  /**
   * 獲取 Sprint 的統計資訊
   * @param {string} sprintId - Sprint ID
   * @returns {Promise<Object>} - Sprint 統計資訊
   */
  async getSprintStatistics(sprintId) {
    try {
      const response = await this.axiosInstance.get(
        '/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=' + this.boardId + '&sprintId=' + sprintId
      );

      return response.data;
    } catch (error) {
      console.error(`獲取 Sprint ${sprintId} 統計資訊時出錯:`, error.message);
      throw error;
    }
  }

  async getIssuesByAssignee(assignee) {
    const jql = `assignee = "${assignee}" ORDER BY updated DESC`;
    const fields = ['key', 'summary', 'status', 'assignee', 'created', 'updated', 'priority'];
    const response = await this.axiosInstance.post('/rest/api/3/search', {
      jql,
      fields,
      maxResults: 50
    });

    return {
      total: response.data.total,
      issues: response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || '未分配',
        created: issue.fields.created,
        updated: issue.fields.updated,
        priority: issue.fields.priority?.name || '未設定'
      }))
    };
  }
}

module.exports = JiraApi;
