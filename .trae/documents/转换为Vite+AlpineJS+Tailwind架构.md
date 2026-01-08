# 将单页应用转换为 Vite + 原生JS + AlpineJS + Tailwind 架构

## 项目结构

```
frontend/
├── index.html              # 主入口
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── tailwind.config.js      # Tailwind配置
├── postcss.config.js       # PostCSS配置
├── src/
│   ├── main.js            # 应用入口
│   ├── api/               # API模块
│   │   ├── auth.js
│   │   ├── ingredients.js
│   │   ├── dishes.js
│   │   ├── stores.js
│   │   └── users.js
│   ├── components/        # AlpineJS组件
│   │   ├── ingredients.js
│   │   ├── dishes.js
│   │   ├── useDish.js
│   │   ├── consumption.js
│   │   ├── operationLogs.js
│   │   └── settings.js
│   ├── utils/             # 工具函数
│   │   └── storage.js
│   └── styles/
│       └── main.css       # Tailwind入口
└── public/
    └── assets/            # 静态资源
```

## 转换步骤

### 1. 初始化Vite项目
- 创建 `package.json`
- 安装依赖：`vite`, `alpinejs`, `tailwindcss`, `postcss`, `autoprefixer`, `xlsx`

### 2. 配置文件
- 创建 `vite.config.js` - 配置开发服务器和构建选项
- 创建 `tailwind.config.js` - 配置Tailwind
- 创建 `postcss.config.js` - PostCSS配置（必需，Tailwind依赖PostCSS处理）

### 3. 拆分HTML结构
- 创建 `index.html` 作为主入口
- 使用AlpineJS的 `x-data` 和 `x-template` 组织组件
- 将各个功能模块拆分为独立的组件模板

### 4. 拆分JavaScript逻辑
**API模块** (`src/api/`):
- `auth.js` - 登录、登出、认证检查
- `ingredients.js` - 食材CRUD操作
- `dishes.js` - 菜品CRUD、使用操作
- `stores.js` - 店铺管理
- `users.js` - 用户管理

**组件模块** (`src/components/`):
- `ingredients.js` - 食材管理组件（AlpineJS）
- `dishes.js` - 菜品管理组件
- `useDish.js` - 菜品使用组件（含Excel处理，使用npm的xlsx库）
- `consumption.js` - 消耗统计组件
- `operationLogs.js` - 操作记录组件
- `settings.js` - 系统设置组件

**工具模块** (`src/utils/`):
- `storage.js` - localStorage和token管理

### 5. 重构关键功能
- 使用AlpineJS的响应式数据替代手动DOM操作
- 使用 `x-for` 替代手动生成HTML
- 使用 `x-show/x-if` 替代classList操作
- 使用 `@click` 等事件指令替代addEventListener
- 保持所有业务逻辑不变，确保功能完全一致

### 6. 保留Excel功能
- 使用npm安装的 `xlsx` 库替代CDN版本（更好的版本控制、更快的加载速度）
- 保持批量使用菜品功能完整

### 7. 样式处理
- 使用npm安装的Tailwind CSS替代CDN
- 保留所有自定义样式

## 预期效果
- 代码行数从1749行减少到约800-1000行（分散在多个文件）
- 更好的代码组织和可维护性
- 更快的开发体验（Vite热更新）
- 保持所有原有功能完全一致