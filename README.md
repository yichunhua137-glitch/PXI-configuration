# PXI Configuration

一个基于 React + Vite 的 PXI 配置页面原型项目。

当前仓库不是原先那份前后端分离的完整系统，而是一个前端单页 UI 原型，用来先确认页面风格、机箱展示方式、办卡信息展示位，以及后续真实照片的接入方式。

## 当前状态

- 已完成一个首页级 UI 初稿
- 配色已调整为偏 NI 风格的白底绿色方案
- 页面包含 PXI 机箱示意、流程区、照片预留区
- 当前还没有接入真实后端、数据库或配置编辑逻辑
- 当前也没有实现 README 旧版本里提到的 FastAPI、Docker Compose、React Router、Tailwind、Konva 等结构

## 技术栈

- React 19
- Vite 7
- JavaScript (JSX)
- CSS
- ESLint

## 目录结构

```text
.
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx         # 主页面结构
│   ├── App.css         # 页面组件样式
│   ├── index.css       # 全局样式与主题变量
│   └── main.jsx        # React 入口
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 本地运行

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

## 可用脚本

启动开发服务器：

```bash
npm run dev
```

打包生产文件：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

运行 ESLint：

```bash
npm run lint
```

## 页面说明

当前页面主要分为三个部分：

1. 顶部主视觉区
   展示 PXI 配置工具定位、主按钮和概览信息。
2. 机箱示意区
   用卡片方式模拟 controller、module、reserved 槽位布局。
3. 内容展示区
   预留机箱照片、办卡照片，以及配置流程说明。

## 后续建议

如果后面继续往真实项目推进，建议按下面顺序扩展：

1. 接入真实机箱照片和办卡照片
2. 把机箱示意替换成真实槽位布局
3. 增加配置表单或编辑器页面
4. 再决定是否需要接入后端 API、数据库和导出功能

## 说明

- 旧 README 中提到的完整系统结构目前不在这个仓库里
- 当前 README 以实际存在的文件和功能为准
- 如果后面你把项目扩展成真正的前后端系统，README 需要再更新一次
