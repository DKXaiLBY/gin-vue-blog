package model

import (
	"gorm.io/gorm"
)

// 项目展示: 个人作品/项目卡片, 后台管理, 前台项目页展示
type Project struct {
	Model
	Name      string `gorm:"type:varchar(100)" json:"name"`
	Cover     string `gorm:"type:varchar(255)" json:"cover"`
	Url       string `gorm:"type:varchar(255)" json:"url"`        // 在线地址
	RepoUrl   string `gorm:"type:varchar(255)" json:"repo_url"`   // 源码地址
	Intro     string `gorm:"type:varchar(500)" json:"intro"`      // 一句话介绍
	TechStack string `gorm:"type:varchar(255)" json:"tech_stack"` // 技术栈, 逗号分隔
	Sort      int    `gorm:"default:0" json:"sort"`               // 展示顺序, 越小越靠前
}

func GetProjectList(db *gorm.DB, num, size int, keyword string) (list []Project, total int64, err error) {
	db = db.Model(&Project{})
	if keyword != "" {
		db = db.Where("name LIKE ?", "%"+keyword+"%")
		db = db.Or("intro LIKE ?", "%"+keyword+"%")
		db = db.Or("tech_stack LIKE ?", "%"+keyword+"%")
	}
	db.Count(&total)
	result := db.Order("sort ASC, created_at DESC").
		Scopes(Paginate(num, size)).
		Find(&list)
	return list, total, result.Error
}

// 前台项目列表: 数量少, 不分页, 全量按排序返回
func GetFrontProjectList(db *gorm.DB) (list []Project, err error) {
	err = db.Model(&Project{}).
		Order("sort ASC, created_at DESC").
		Find(&list).Error
	return list, err
}

func SaveOrUpdateProject(db *gorm.DB, id int, name, cover, url, repoUrl, intro, techStack string, sort int) (*Project, error) {
	project := Project{
		Model:     Model{ID: id},
		Name:      name,
		Cover:     cover,
		Url:       url,
		RepoUrl:   repoUrl,
		Intro:     intro,
		TechStack: techStack,
		Sort:      sort,
	}

	// Select 指定列更新: gorm 用 struct 更新时默认跳过零值字段,
	// 不指定列的话清空简介/把排序改回 0 都不会落库
	var result *gorm.DB
	if id > 0 {
		result = db.Model(&project).Select("name", "cover", "url", "repo_url", "intro", "tech_stack", "sort").Updates(&project)
	} else {
		result = db.Create(&project)
	}

	return &project, result.Error
}
