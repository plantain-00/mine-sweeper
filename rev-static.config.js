module.exports = {
  inputFiles: [
    'index.min.js',
    'index.min.css',
    'index.ejs.html'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName
}
