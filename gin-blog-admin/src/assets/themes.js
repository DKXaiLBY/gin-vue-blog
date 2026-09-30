// TODO: 响应式
export default {
  header: {
    height: 60,
  },
  tags: {
    visible: true,
    height: 50,
  },
  naiveThemeOverrides: {
    common: {
      // 品牌色与前台 --c-primary 同源 (#6366f1), 全后台的按钮/菜单/开关跟着变
      primaryColor: '#6366F1FF',
      primaryColorHover: '#818CF8FF',
      primaryColorPressed: '#4F46E5FF',
      primaryColorSuppl: '#818CF8FF',

      infoColor: '#2080F0FF',
      infoColorHover: '#4098FCFF',
      infoColorPressed: '#1060C9FF',
      infoColorSuppl: '#4098FCFF',

      successColor: '#18A058FF',
      successColorHover: '#36AD6AFF',
      successColorPressed: '#0C7A43FF',
      successColorSuppl: '#36AD6AFF',

      warningColor: '#F0A020FF',
      warningColorHover: '#FCB040FF',
      warningColorPressed: '#C97C10FF',
      warningColorSuppl: '#FCB040FF',

      errorColor: '#D03050FF',
      errorColorHover: '#DE576DFF',
      errorColorPressed: '#AB1F3FFF',
      errorColorSuppl: '#DE576DFF',
    },
  },
}
