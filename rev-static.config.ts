export default {
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
  outputFiles: (file: string) => file.replace('.ejs', ''),
  ejsOptions: {
    rmWhitespace: true
  },
  sha: 256,
  customNewFileName: (_filePath: string, _fileString: string, md5String: string, baseName: string, extensionName: string) => baseName + '-' + md5String + extensionName,
  fileSize: 'file-size.json',
  context: {
    buildMoment: new Date().toString()
  }
}
