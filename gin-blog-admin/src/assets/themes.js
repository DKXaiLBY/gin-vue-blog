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
      // 品牌色与前台 --c-primary 同源 (#3b82f6), 全后台的按钮/菜单/开关跟着变
      primaryColor: '#3B82F6FF',
      primaryColorHover: '#60A5FAFF',
      primaryColorPressed: '#2563EBFF',
      primaryColorSuppl: '#60A5FAFF',

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
