module.exports = {
  build: [
    `rimraf *.bundle-*.js *.bundle-*.css`,
    `rimraf dist`,
    `tsc`,
    `file2variable-cli index.template.html -o variables.ts --html-minify`,
    `tsc`,
    `lessc index.less > index.css`,
    `cleancss -o index.bundle.css index.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css`,
    `webpack --display-modules --config webpack.config.js`,
    `rev-static --config rev-static.config.js`,
    `sw-precache --config sw-precache.config.js --verbose`,
    `uglifyjs service-worker.js -o service-worker.bundle.js`
  ],
  lint: [
    `tslint "index.ts"`,
    `standard "**/*.config.js"`,
    `stylelint "index.less"`
  ],
  test: [
    'tsc -p spec',
    'karma start spec/karma.config.js'
  ],
  fix: [
    `standard --fix "**/*.config.js"`
  ]
}
