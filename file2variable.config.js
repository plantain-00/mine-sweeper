module.exports = {
  files: [
    'index.template.html'
  ],
  /**
   * @argument {string} file
   */
  handler: file => {
    return {
      type: 'vue',
      name: 'App',
      path: './index'
    }
  },
  out: 'variables.ts'
}
