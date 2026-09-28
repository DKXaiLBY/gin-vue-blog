package handle

import (
	g "gin-blog/internal/global"
	"gin-blog/internal/model"

	"github.com/gin-gonic/gin"
)

type Project struct{}

// 添加或修改项目
type AddOrEditProjectReq struct {
	ID        int    `json:"id"`
	Name      string `json:"name" binding:"required"`
	Cover     string `json:"cover"`
	Url       string `json:"url"`
	RepoUrl   string `json:"repo_url"`
	Intro     string `json:"intro"`
	TechStack string `json:"tech_stack"`
	Sort      int    `json:"sort"`
}

// @Summary 条件查询项目列表
// @Description 关键字匹配名称/简介/技术栈
// @Tags Project
// @Produce json
// @Param keyword query string false "关键字"
// @Param page_num query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 0 {object} Response[PageResult[model.Project]]
// @Security ApiKeyAuth
// @Router /project/list [get]
func (*Project) GetList(c *gin.Context) {
	var query PageQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		ReturnError(c, g.ErrRequest, err)
		return
	}

	data, total, err := model.GetProjectList(GetDB(c), query.Page, query.Size, query.Keyword)
	if err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}

	ReturnSuccess(c, PageResult[model.Project]{
		Total: total,
		List:  data,
		Size:  query.Size,
		Page:  query.Page,
	})
}

// @Summary 前台项目列表
// @Description 全量按排序返回, 供前台项目展示页使用
// @Tags Project
// @Produce json
// @Success 0 {object} Response[[]model.Project]
// @Router /front/project/list [get]
func (*Project) GetFrontList(c *gin.Context) {
	list, err := model.GetFrontProjectList(GetDB(c))
	if err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}

	ReturnSuccess(c, list)
}

// @Summary 新增或编辑项目
// @Description 新增或编辑项目
// @Tags Project
// @Accept json
// @Produce json
// @Param form body AddOrEditProjectReq true "新增或编辑项目"
// @Success 0 {object} Response[model.Project]
// @Security ApiKeyAuth
// @Router /project [post]
func (*Project) SaveOrUpdate(c *gin.Context) {
	var req AddOrEditProjectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		ReturnError(c, g.ErrRequest, err)
		return
	}

	project, err := model.SaveOrUpdateProject(GetDB(c), req.ID, req.Name, req.Cover, req.Url, req.RepoUrl, req.Intro, req.TechStack, req.Sort)
	if err != nil {
		ReturnError(c, g.ErrDbOp, err)
		return
	}

	ReturnSuccess(c, project)
}

// @Summary 删除项目（批量）
// @Description 根据 ID 数组删除项目
// @Tags Project
// @Accept json
// @Produce json
// @Param ids body []int true "项目 ID 数组"
// @Success 0 {object} Response[int64]
// @Security ApiKeyAuth
// @Router /project [delete]
func (*Project) Delete(c *gin.Context) {
	var ids []int
	if err := c.ShouldBindJSON(&ids); err != nil {
		ReturnError(c, g.ErrRequest, err)
		return
	}

	result := GetDB(c).Delete(&model.Project{}, "id in ?", ids)
	if result.Error != nil {
		ReturnError(c, g.ErrDbOp, result.Error)
		return
	}

	ReturnSuccess(c, result.RowsAffected)
}
