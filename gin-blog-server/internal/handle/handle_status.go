package handle

import (
	"runtime"
	"strconv"
	"time"

	g "gin-blog/internal/global"
	"gin-blog/internal/model"

	"github.com/gin-gonic/gin"
)

/*
前台状态接口: 供 /status 页面展示站点运行状态。
只暴露非敏感的运行数据(进程内存/协程数/内容计数), 不含任何配置、路径或用户信息。
processStart 在包初始化时记录, 即进程启动时间。
*/

var processStart = time.Now()

type SiteStatus struct {
	GoVersion  string `json:"go_version"`
	Goroutines int    `json:"goroutines"`
	HeapMB     string `json:"heap_mb"`
	UptimeS    int64  `json:"uptime_seconds"`
	Articles   int64  `json:"articles"`
	Talks      int64  `json:"talks"`
	Projects   int64  `json:"projects"`
}

// @Summary 前台站点状态
// @Description 输出站点运行状态(运行时长/内存/内容计数), 供状态页展示
// @Tags Front
// @Produce json
// @Success 200 {object} SiteStatus
// @Router /front/status [get]
func (*Front) GetStatus(c *gin.Context) {
	db := GetDB(c)

	var articles, talks, projects int64
	if err := db.WithContext(c.Request.Context()).Table("article").Where("status = ?", model.STATUS_PUBLIC).Count(&articles).Error; err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}
	if err := db.WithContext(c.Request.Context()).Table("talk").Count(&talks).Error; err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}
	if err := db.WithContext(c.Request.Context()).Table("project").Count(&projects).Error; err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}

	var ms runtime.MemStats
	runtime.ReadMemStats(&ms)

	ReturnSuccess(c, SiteStatus{
		GoVersion:  runtime.Version(),
		Goroutines: runtime.NumGoroutine(),
		HeapMB:     fmtHeapMB(ms.HeapAlloc),
		UptimeS:    int64(time.Since(processStart).Seconds()),
		Articles:   articles,
		Talks:      talks,
		Projects:   projects,
	})
}

func fmtHeapMB(b uint64) string {
	return strconv.FormatFloat(float64(b)/1024/1024, 'f', 1, 64)
}
