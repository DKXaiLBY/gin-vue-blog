package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncrypt(t *testing.T) {
	password := "123456"

	// 加密
	hashPassword, err := BcryptHash(password)
	assert.Nil(t, err)

	// 验证
	result := BcryptCheck(password, hashPassword)
	assert.True(t, result)
}

func TestShortHash(t *testing.T) {
	// SHA-256("123456") 截断前 16 字节, 输出定长 32 字符
	assert.Equal(t, "8d969eef6ecad3c29a3a629280e686cf", ShortHash("123456"))
}
