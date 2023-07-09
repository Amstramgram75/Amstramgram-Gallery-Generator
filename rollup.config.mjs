//noderesolve and commonjs are needed for prism.js
import noderesolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
//JS
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
//CSS
import css from 'rollup-plugin-postcss-amstramgram'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import cssnano from 'cssnano'
//HTML
import html from 'rollup-plugin-posthtml-amstramgram'
import htmlinclude from 'posthtml-include'
import htmlnano from 'htmlnano'
//Assets
import fsExtra from 'fs-extra'//To empty prod folder when building for production
import copy from 'rollup-plugin-copy'//Copy assets folder from dev to prod folder
import path from 'path'
import reflect from '@alumna/reflect'//Mirroring "dev/assets" to "prod/assets"
import { minify } from "terser"

/**
 * @param {Buffer} send by rollup-plugin-copy in transform option
 * @returns code extracted and minified
 */
async function minifyJs(code) {
  let result = await minify(code.toString())
  return result.code
}

const
  src = 'docs_src/',
  dev = 'docs_dev/',
  prod = 'docs/',
  app = 'src/',
  dist = 'dist/',
  dest = process.env.BUILD === 'development' ? dev : prod,
  theExports = [],
  //Babel basic configuration
  babelModule = {
    babelHelpers: 'bundled',
    plugins: [
      ['prismjs', {
        'languages': ['javascript', 'js-extras', 'jsdoc', 'html'],
      }]
    ]
  },
  //Babel configuration to support old browsers
  babelNoModule = Object.assign({
    presets: [
      [
        "@babel/preset-env"
      ]
    ]
  }, babelModule)

if (process.env.BUILD === 'package') {
  //Create dist if it does not exist, 
  fsExtra.ensureDirSync(dist)
  fsExtra.emptyDirSync(dist)
} else {
  if (process.env.BUILD === 'production') {
    //Create prod/assets if it does not exist, 
    fsExtra.ensureDirSync(`${prod}assets/`)
    const
      { res, err } = await reflect({
        src: `${dev}assets/`,
        dest: `${prod}assets/`,
      }),
      msg = err ? `\x1b[31m${err}` : `\x1b[33m${res}`//Directory "dev/assets" reflected to "prod/assets"
    console.log(msg)
    //Emptying all prod files and folders except assets directory
    fsExtra.readdirSync(prod).filter(file => file != 'assets').forEach(file => fsExtra.removeSync(path.resolve(prod + file)))
  }

  //FIRST ROLLUP TASK :
  //- bundle index.js in a module
  //- compile css (with minification if in production)
  //- compile html (with minification if in production)
  //- minify js if in production
  theExports.push(
    {
      input: `${src}js/index.js`,
      output:
      {
        file: `${dest}js/index.js`,
        format: 'esm',
        sourcemap: process.env.BUILD === 'development',
      },
      plugins: [
        noderesolve(),
        commonjs(),
        babel(babelModule),
        //main.css
        css({
          jobs: { from: `${src}css`, to: `${dest}css` },
          sourcemap: process.env.BUILD === 'development',
          plugins: [
            postcssImport(),
            postcssPresetEnv({ stage: 1 }),
            ...(process.env.BUILD === 'production' ? [cssnano()] : [])
          ]
        }),
        //index.html
        html({
          jobs: { from: `${src}index.html/`, to: dest },
          watch: true,
          plugins: [
            htmlinclude({
              root: `${src}html/`
            }),
            ...(process.env.BUILD === 'production' ? [htmlnano()] : [])
          ]
        }),
        copy({
          targets: [
            //minify polyfills/polyfills.js
            {
              src: `${src}js/polyfills/polyfills.js`,
              dest: `${dest}js/polyfills/`,
              transform: content => minifyJs(content),
              rename: (name, extension) => `${name}.min.${extension}`
            }
          ]
        }),
        ...(process.env.BUILD === 'development' ?
          //DEVELOPMENT
          [
          ]
          :
          //PRODUCTION : minify js
          [
            terser()
          ]
        )
      ],
      //Comment/Uncomment if you need
      watch: {
        clearScreen: process.env.BUILD === 'production',
      },
    }
  )

  //SECOND ROLLUP TASK : bundle index.js in IIFE format
  //for usage in index.html
  theExports.push(
    {
      input: `${src}js/index.js`,
      output: {
        file: `${dest}js/noModule/index.js`,
        format: 'iife'
      },
      watch: {
        clearScreen: process.env.BUILD === 'production'
      },
      plugins: [
        noderesolve(),
        commonjs(),
        babel(babelNoModule),
        ...(process.env.BUILD === 'production' ? [terser()] : []),
      ]
    }
  )
}

//Export rollup tasks
export default theExports