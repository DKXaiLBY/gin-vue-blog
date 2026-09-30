package handle

import (
	"fmt"
	"strings"
	"time"

	g "gin-blog/internal/global"
	"gin-blog/internal/model"

	"github.com/gin-gonic/gin"
)

/*
前台 RSS 2.0 订阅源: 输出最新 20 篇公开文章。
站点链接从请求 Host 动态拼装, 换域名/IP 无需改代码。
*/

// @Summary 前台 RSS 订阅
// @Description 输出最新 20 篇公开文章的 RSS 2.0 订阅源
// @Tags Front
// @Produce xml
// @Success 200 {string} string
// @Router /front/rss [get]
func (*Front) GetRSS(c *gin.Context) {
	list, _, err := model.GetBlogArticleList(GetDB(c), 1, 20, 0, 0)
	if err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	siteURL := fmt.Sprintf("%s://%s", scheme, c.Request.Host)

	cfg, _ := model.GetConfigMap(GetDB(c))
	siteName := cfg["website_name"]
	if siteName == "" {
		siteName = "DKXaiLBY 的个人博客"
	}

	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	b.WriteString(`<rss version="2.0">` + "\n  <channel>\n")
	b.WriteString("    <title>" + xmlEscape(siteName) + "</title>\n")
	b.WriteString("    <link>" + xmlEscape(siteURL) + "</link>\n")
	b.WriteString("    <description>" + xmlEscape(cfg["website_intro"]) + "</description>\n")
	b.WriteString("    <language>zh-CN</language>\n")
	for _, a := range list {
		link := fmt.Sprintf("%s/article/%d", siteURL, a.ID)
		b.WriteString("    <item>\n")
		b.WriteString("      <title>" + xmlEscape(a.Title) + "</title>\n")
		b.WriteString("      <link>" + xmlEscape(link) + "</link>\n")
		b.WriteString("      <description>" + xmlEscape(a.Desc) + "</description>\n")
		b.WriteString("      <pubDate>" + a.CreatedAt.UTC().Format(time.RFC1123Z) + "</pubDate>\n")
		b.WriteString("      <guid>" + xmlEscape(link) + "</guid>\n")
		b.WriteString("    </item>\n")
	}
	b.WriteString("  </channel>\n</rss>\n")

	// 半小时缓存: RSS 阅读器拉取频繁, 内容更新频率远低于此
	c.Header("Cache-Control", "public, max-age=1800")
	c.Data(200, "application/xml; charset=utf-8", []byte(b.String()))
}

// xmlEscape XML 特殊字符转义: 标题/简介来自用户输入, 必须转义防注入破坏 XML 结构
func xmlEscape(s string) string {
	return strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&apos;",
	).Replace(s)
}
