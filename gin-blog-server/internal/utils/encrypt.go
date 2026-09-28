package utils

import (
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

// 使用 bcrypt 对字符串进行加密生成一个哈希值
func BcryptHash(str string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	return string(bytes), err
}

// 使用 bcrypt 对比 明文字符串 和 哈希值
func BcryptCheck(plain, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	return err == nil
}

// 32 位十六进制短哈希(SHA-256 截断), 用于访客指纹、限流键、文件名混淆等非加密场景
// 输出定长 32 字符, 与旧 MD5 实现等宽, 存储列宽无需变动
func ShortHash(str string) string {
	sum := sha256.Sum256([]byte(str))
	return hex.EncodeToString(sum[:16])
}
