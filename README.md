# DKXaiLBY 的个人博客

一个面向求职的作品集博客：基于开源项目 [gin-vue-blog](https://github.com/szluyu99/gin-vue-blog) 深度二次开发，包含大量定制改造与自研模块。

## 在线地址

- 主站（阿里云 ECS 自部署）：http://47.121.119.191
- Mock 演示站（GitHub Pages，免登录浏览）：https://dkxailby.github.io/gin-vue-blog/

## 相比上游的定制内容

### 安全
- 修复上游 MD5 弱哈希（访客指纹/错误聚合键迁移至 SHA-256 截断，存储列宽零变更）
- config 表 value 列扩容（修复"关于我"长文本无法保存的上游缺陷）
- 后台管理入口双层防护（BasicAuth + JWT）、数据库/缓存不暴露公网

### 前台
- 卡片式现代风主题：品牌色收敛为 CSS 变量单一出口，明暗双主题跟随系统
- 自研**项目展示模块**（卡片网格页，含空状态与骨架屏）
- 新增**在线简历页**（`/resume`，配置驱动 + 打印导出 PDF）与**历程时间线**（`/timeline`）
- 接入 giscus 评论（GitHub Discussions）与 GitHub 提交热力图
- 页面横幅/封面全量本地化（渐变 SVG），不再依赖外部图床

### 后台
- 品牌色与登录页重设计，与前台视觉统一
- 项目管理页（naive-ui CRUD + 封面上传）

### 部署
- Docker Compose 全栈（nginx + Go + MySQL + Redis），与同机其他服务共存
- 端口全部收敛至 127.0.0.1，宿主 nginx 统一反代
- GitHub Actions 流水线（CI 校验 gofmt/单测/Swagger 一致性）

## 技术栈

Vue3 · TypeScript · UnoCSS · Naive UI · Go · Gin · GORM · MySQL · Redis · Docker

## 本地开发

```bash
# 前台 (Mock 模式, 无需后端)
cd gin-blog-front && pnpm install && pnpm dev

# 一键 Docker 全栈
cd deploy && sh bootstrap.sh
```

## 致谢与许可

底座来自 [szluyu99/gin-vue-blog](https://github.com/szluyu99/gin-vue-blog)，感谢原作者的优秀开源项目。本仓库所有二开改动遵循同样的 [MIT License](LICENSE)。
