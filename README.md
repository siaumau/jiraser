# Jira API 工具

這個專案提供了一個簡單的 Node.js 工具，用於與 Jira API 進行互動，獲取 Sprint、問題和統計資訊。支援命令行操作、本地 Web 服務，以及便捷的 Windows 批次檔操作方式。

## 功能特點

- 獲取所有活躍的 Sprint
- 獲取指定 Sprint 中的問題
- 獲取特定問題的詳細資訊
- 獲取 Sprint 的統計資訊
- 獲取所有 Sprint（包括已完成的）
- 完整的日誌記錄功能
- 中文界面支援
- 便捷的批次檔操作界面
- 問題列表支援排序功能
- 狀態顯示使用顏色區分
- 統計資訊可展開/收合
- 問題詳細資訊快速導航
- 合併搜尋（支援同時搜尋摘要和問題金鑰）

## 使用者介面功能

### 1. 問題列表功能
- 支援點擊欄位標題進行排序（升序/降序）
- 問題金鑰支援點擊直接查看詳細資訊
- 狀態使用不同顏色標示：
  - 待辦：淺灰色 (#6B778C)
  - 進行中：藍綠色 (#0097A9)
  - 待審核：紫色 (#6554C0)
  - 完成/已關閉：綠色 (#36B37E)
  - 阻擋：紅色 (#FF5630)
  - 工作暫停：橙色 (#FF991F)

### 2. 統計資訊
- 可透過按鈕切換顯示/隱藏
- 包含三個主要區塊：
  - Sprint 摘要（總計、時間統計、完成率）
  - 狀態分布（各狀態的數量和百分比）
  - 團隊成員統計（每個成員的任務分配和完成情況）

### 3. 問題詳細資訊
- 支援從問題列表直接點擊查看
- 自動滾動到詳細資訊區域
- 提供快速返回問題列表的按鈕
- 顯示完整的問題資訊（包含描述、標籤等）

### 4. 搜尋和篩選
- 合併式搜尋框支援同時搜尋摘要和問題金鑰
- 支援專案金鑰篩選
- 支援負責人篩選
- 自動更新篩選結果統計

## 安裝與設定

1. **克隆此專案**

2. **安裝依賴**：
   ```bash
   npm install
   ```

3. **安裝 Web 服務所需的額外依賴**：
   ```bash
   npm install express cors body-parser
   ```

4. **設定環境變數**：
   創建 `.env` 檔案，並設置以下環境變數：
   ```
   JIRA_DOMAIN=your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-api-token
   JIRA_BOARD_ID=your-board-id
   ```

#### jira-tool.bat

這是一個功能更完整的批次檔，提供選單界面讓您選擇不同的操作。

**使用方法**：
1. 雙擊 `jira-tool.bat` 檔案
2. 在選單中選擇您想要執行的操作：
   - `[1]` 安裝必要套件
   - `[2]` 啟動 Web 服務
   - `[3]` 執行範例查詢
   - `[4]` 查詢活躍的 Sprint
   - `[5]` 查詢特定 Sprint 中的問題
   - `[6]` 查詢特定問題的詳細資訊
   - `[7]` 檢查環境設定
   - `[8]` 查看日誌檔案
   - `[0]` 退出

### 2. 命令行模式

1. **運行主程式**：
   ```bash
   npm start
   ```

2. **使用 npm 腳本**：
   - 獲取活躍的 Sprint：
     ```bash
     npm run active-sprints
     ```
   - 獲取指定 Sprint 中的問題：
     ```bash
     npm run sprint-issues "Sprint 10"
     ```
   - 獲取特定問題的詳細資訊：
     ```bash
     npm run issue-details "TWIT-123"
     ```
   - 運行範例程式：
     ```bash
     npm run examples
     ```

### 3. Web 服務模式

1. **啟動 Web 服務**：
   ```bash
   npm run server
   ```

2. **使用網頁界面**：
   訪問 `http://localhost:3000`，您可以：
   - 獲取所有活躍的 Sprint
   - 獲取指定 Sprint 中的問題
   - 獲取特定問題的詳細資訊
   - 獲取 Sprint 統計資訊

### 4. API 端點

1. **獲取所有活躍的 Sprint**：
   ```
   GET http://localhost:3000/api/sprints/active
   ```

2. **獲取所有 Sprint**：
   ```
   GET http://localhost:3000/api/sprints
   ```

3. **獲取指定 Sprint 中的問題**：
   ```
   GET http://localhost:3000/api/sprints/{sprintName}/issues?projectKey={projectKey}
   ```

4. **獲取特定問題的詳細資訊**：
   ```
   GET http://localhost:3000/api/issues/{issueKey}
   ```

5. **獲取 Sprint 統計資訊**：
   ```
   GET http://localhost:3000/api/sprints/{sprintId}/statistics
   ```

## 日誌功能

批次檔包含完整的日誌功能，可以幫助您追蹤服務的運行狀況和排查問題：

1. **自動日誌記錄**：
   - 所有操作都會自動記錄到 `logs` 目錄中
   - 日誌檔案名稱格式：`jira-service-YYYYMMDD_HHMMSS.log` 或 `jira-tool-YYYYMMDD_HHMMSS.log`
   - 記錄內容包括操作時間、執行的命令和結果

2. **查看日誌**：
   - 使用 `jira-tool.bat` 中的選項 `[8]` 查看日誌檔案
   - 可查看當前會話或之前的日誌

## 專案結構

```
jira-api-tool/
├── .env                  # 環境變數
├── .gitignore           # Git 忽略檔案
├── jiraApi.js           # Jira API 工具類別
├── index.js             # 主程式
├── examples.js          # 範例程式
├── server.js            # Web 服務
├── start-jira-service.bat # Windows 快速啟動批次檔
├── jira-tool.bat        # Windows 工具選單批次檔
├── package.json         # 專案配置
└── public/              # Web 界面
    ├── index.html       # HTML 頁面
    ├── styles.css       # CSS 樣式
    └── app.js          # 前端 JavaScript
```

## 常見問題

1. **批次檔無法執行**
   - 確保有足夠的執行權限
   - 嘗試以管理員身份運行

2. **無法安裝套件**
   - 檢查網絡連接
   - 確保 `package.json` 存在且正確
   - 查看日誌檔案以獲取詳細錯誤信息

3. **服務啟動後無法訪問**
   - 確保端口 3000 未被佔用
   - 檢查防火牆設定
   - 查看日誌檔案中的錯誤信息

4. **查詢返回錯誤**
   - 檢查 `.env` 檔案設定
   - 確保 API 令牌有效且具有足夠權限
   - 查看日誌檔案以獲取詳細錯誤信息

5. **中文顯示亂碼**
   - 確保系統支援 UTF-8 編碼
   - 在命令提示符中執行 `chcp 65001`

## 注意事項

- 批次檔僅適用於 Windows 系統
- 使用 `Ctrl+C` 停止服務時可能需要確認（輸入 Y）
- 修改專案檔案後需重新啟動服務
- 定期清理 `logs` 目錄中的日誌檔案
- 請勿將 `.env` 檔案提交到版本控制系統
- 本工具僅供內部使用，不建議暴露在公共網路

## 進階功能開發

如果您需要擴展功能，可以：

1. **添加新的查詢功能**：
   - 在 `jiraApi.js` 中添加新方法
   - 在 `server.js` 中添加新路由
   - 在前端添加相應界面

2. **自定義使用**：
   ```javascript
   const JiraApi = require('./jiraApi');
   const jira = new JiraApi();

   // 使用範例
   jira.getActiveSprints().then(sprints => {
     console.log(sprints);
   });
   ```
