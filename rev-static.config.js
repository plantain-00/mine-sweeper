module.exports = {
  inputFiles: [
    '*.bundle.js',
    '*.bundle.css',
    'index.ejs.html'
  ],
  excludeFiles: [
    'service-worker.bundle.js'
  ],
  inlinedFiles: [
    'index.bundle.js',
    'index.bundle.css'
  ],
  outputFiles: file => file.replace('.ejs', ''),
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + '-' + md5String + extensionName,
  fileSize: 'file-size.json'
}
