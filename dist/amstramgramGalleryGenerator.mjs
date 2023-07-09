#!/usr/bin/env node
import path from 'path'
import { pathToFileURL } from 'url'
import fs from 'fs-extra'
import sharp from 'sharp'
import { XMLParser } from 'fast-xml-parser';

/**
 * TODO : general check
 * Integration in website
 */

/**
 * Utility to generate multiple resolutions and formats images
 * from a folder containing reference files.
 * 
 * By default, the script search for a config file named generateGallery.json.
 * Configuration file is provided with -c or --config flag :
 *    npm run generateGallery.mjs -c myConfigFile.mjs
 * Or :
 *    npm run generateGallery.mjs --config myConfigFile.mjs
 * 
 * 
 * @param {string} from
 * @default : 'img/'
 * Path of the folder containing the images to be processed.
 * 
 * @param {string} to
 * @default : 'imgProcessed/'
 * Path of the destination folder (if it does not exist, it will be created).
 *  
 * @param {string||string[]} exts
 * @default : ['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']
 * Sets the extensions of the files to be processed.
 * 
 * @param {string||string[]} formats
 * @default : ['.avif', '.webp', '.jpg']
 * Sets the formats in which images are processed.
 * Note that output formats are restricted to avif, jpg or webp. 
 * @example : 
 *    formats: "avif"
 *  or
 *    formats: ".avif"
 *  or
 *    formats: [".avif"]
 * 
 * @param {integer||integer[]} widths
 * @default : [400, 800, 1200, 1600, 2000, 2400, 2800, 3200]
 * Sets the widths in which images are processed.
 * 
 * @param {integer} maxHeight
 * @default : 3200
 * Sets the maximum height of the processed images.
 * If an image is 4000 x 6000, the resulting height for a 2400 width will be 3600.
 * With the default settings above, only the 400, 800, 1200, 1600 and 2000 images will be processed.
 * 
 * @param {function} name
 * @return {string}
 * @default : (originalName, processedWidth, processedHeight) => return originalName + '_' + processedWidth + '_' + processedHeight
 * Defines how the processed image is renamed.
 * originalName, processedWidth, processedHeight, title, creator, description 
 * are passed as parameters to the function
 * title, creator and description are taken from xmp datas dc:title, dc:creator and dc:description.
 * You can edit these properties with XnView MP, freeware available for Windows, Mac and Linux.
 * https://www.xnview.com/en/xnviewmp/#downloads
 *      
 * @param {boolean} verbose
 * @default : true
 * If false, no log will be emitted.
 * 
 * @param {boolean} force
 * @default : false
 * If false, the script will only processed images that are not already in output directory.
 * 
 * @param {boolean|object} thumbnails
 * @default : false
 * If true, thumbnails will be generated with default settings.
 * If it's an object, it could have the following properties :
 *    @param {string} to
 *    @default : 'imgProcessed/thumbs/'
 *    Path of the destination folder (if it does not exist, it will be created).
 *    By default, a thumbs folder is created in the destination folder specified by the main to option.
 *    @param {function} name
 *    @return {string}
 *    @default : (originalName, processedWidth) => return originalName + '_' + processedWidth
 *    Defines how the processed thumbnail is renamed.
 *    originalName, processedWidth, title, creator, description 
 *    are passed as parameters to the function
 *    title, creator and description are taken from xmp datas dc:title, dc:creator and dc:description.
 *    You can edit these properties with XnView MP, freeware available for Windows, Mac and Linux.
 *    https://www.xnview.com/en/xnviewmp/#downloads
 *    @param {integer||integer[]} widths
 *    @default : 100
 *    Sets the widths in which thumbnails are processed.
 *    @param {boolean} square
 *    @default : true
 *    By default, processed thumbnails are square.
 *    If property is set to false, aspect-ratio will be preserved.
 *    @param {string||string[]} formats
 *    @default : ['.avif', '.webp', '.jpg']
 *    Sets the format in which thumbnails are processed
 *    @param {integer||integer[]} queries
 *    @default : undefined
 *    Sets the media queries generated if html option is true.
 *    The generated html is of the form :
 *    <source type="image/jpeg" srcset="thumbnail_100.jpg"/>
 *    <source type="image/jpeg" srcset="thumbnail_120.jpg" media="(min-width:1024px)"/>
 *    Thus, for a screen smaller than 1024px, the thumbnail displayed is 100 pixels wide.
 *    For others, the displayed thumbnail is 120 pixels wide.
 *    !!! Note that queries array length must be equal to widths array length - 1 !!!
 * 
 * @param {boolean|object} html
 * @default : false
 * If true, html will be written to file with default settings.
 * If it's an object, it could have the following properties :
 *    @param {string} to
 *    @default: same as main to option
 *    Path of the destination folder (if it does not exist, it will be created).
 *    @param {string} name
 *    @default : "gallery.html"
 *    Name including extension of the generated file.
 *    @param {string|function} container
 *    @return {string}
 *    @default : () => return 'a'
 *    Sets the HTMLElement used as wrapper.
 *    ('div' for <div></div>, span for <span></span>...).
 *    originalName, title, creator, description 
 *    are passed as parameters to the function
 *    title, creator and description are taken from xmp datas dc:title, dc:creator and dc:description.
 *    You can edit these properties with XnView MP, freeware available for Windows, Mac and Linux.
 *    https://www.xnview.com/en/xnviewmp/#downloads
 *    @param {string|function} comment
 *    @return {string}
 *    @default : () => return ''
 *    The content of the comment inserted before the container.
 *    @param {string|function} class
 *    @return {string}
 *    @default : () => return ''
 *    The value given to the class attribute of the container.
 *    @param {string|function} more
 *    @return {string}
 *    @default : () => return ''
 *    Any additional attributes you want to add.
 *    @param {string|function} caption
 *    @return {string}
 *    @default : () => return ''
 *    The value given to the data-caption attribute of the container.
 *    @param {string|function} alt
 *    @return {string}
 *    @default : () => return ''
 *    The value given to the data-alt attribute of the container.
 *    @param {string|function} title
 *    @return {string}
 *    @default : () => return ''
 *    The value given to the data-title attribute of the container.
 *    @param {string|function} start
 *    @return {string}
 *    @default : () => return ''
 *    The html content of the container inserted before the thumbnail.
 *    @param {boolean} thumbnail
 *    @return {Boolean}
 *    @default : Default is true if main thumbnails option is set to true.
 *    If true, the thumbnail is included in container content between contentStart and contentEnd.
 *    The option will be effective only if thumbnails are generated.
 *    @param {string|function} thumbnailAlt
 *    @return {string}
 *    @default : () => return ''
 *    Content of the thumbnail alt attribute.
 *    @param {string|function} thumbnailTitle
 *    @return {string}
 *    @default : () => return ''
 *    Content of the thumbnail title attribute.
 *    @param {string|function} end
 *    @return {string}
 *    @default : () => return ''
 *    The html content of the container inserted after the thumbnail.
 *    @param {integer} width
 *    @default : 2000
 *    Width used for the fallback .jpg image.
 * !!!Note that jpg images are always generated if html is true!!!
 * 
 */

const
  AVAILABLE_OUTPUT_IMG_FORMATS = new Set(['.avif', '.webp', '.jpg']),
  //Add point if omitted and force to lowercase : JPG => .jpg
  normalizeExtension = e => { return e.startsWith('.') ? e.toLowerCase() : '.' + e.toLowerCase() },
  log = (...t) => console.log(...t),
  //Log utilities
  //https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
  /**
   * @param {string} t : a string to decorate for log
   * @param {integer} start : 
   * @param {integer} [39] end :
   * @example :
   * decorate(This is a test, 1, 22) 
   * returns 
   * \u001b[1mThis is a test\u001b[22m
   * ie This is a test in bold
   */
  decorate = (t, start, end = 39) => `\u001b[${start}m${t}\u001b[${end}m`,
  bold = t => decorate(t, 1, 22),
  italic = t => decorate(t, 3, 23),
  red = t => decorate(bold(t), 31),
  green = t => decorate(bold(t), 32),
  magenta = t => decorate(bold(t), 35)


let
  configFile = undefined,
  inputDir = 'img/',
  outputDir = 'imgProcessed/',
  inputImgExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']),
  outputImgFormats = AVAILABLE_OUTPUT_IMG_FORMATS,
  outputImgWidths = new Set([400, 800, 1200, 1600, 2000, 2400, 2800, 3200]),
  outputImgMaxHeight = 2000,
  processedImgName = (name, width, height) => {
    return name + '_' + width + '_' + height
  },
  verbose = true,
  force = false,
  thumbnailsDefault = {
    dir: outputDir + 'thumbs/',
    name: (name, width) => {
      return name + '_' + width
    },
    widths: new Set([100]),
    square: true,
    queries: new Set(),
    formats: AVAILABLE_OUTPUT_IMG_FORMATS
  },
  thumbnails = false,
  htmlDefault = {
    dir: outputDir,
    root: '',
    name: 'gallery.html',
    wrapper: '',
    wrapperAttr: '',
    thumbnail: false,
    container: () => 'a',
    comment: () => '',
    class: () => '',
    title: () => '',
    alt: () => '',
    more: () => '',
    caption: () => '',
    start: () => '',
    thumbnailAlt: () => '',
    thumbnailTitle: () => '',
    end: () => '',
    width: 2000
  },
  html = false,
  imgToProcess = [],
  imgProcessed = {}

/**
 * configFile is passed as argument with
 * -c configFile
 * or
 * --config configFile
 * So, we searched for a "-c" or a "--config" argument
 * If we find one, configFile should be the next argument
 */
const indexOfConfigArg = process.argv.indexOf('-c') > -1 ? process.argv.indexOf('-c') : process.argv.indexOf('--config')
if (indexOfConfigArg > - 1) configFile = process.argv[indexOfConfigArg + 1]

if (configFile) {
  if (typeof configFile === 'string') {
    if (fs.existsSync(configFile)) {
      if (path.extname(configFile) != '.mjs') {
        log(red((`Configuration file ${italic(configFile)} must have a ${italic("mjs")} extension.`)))
      } else {
        log(magenta(`Loading configuration file ${italic(configFile)}...`))
        loadConfig()
      }
    } else {
      log(red((`Configuration file ${italic(configFile)} can't be found.`)))
    }
  } else {
    log(red((`Don't know how it's possible but I received something other than a string as configuration file :\n${italic(configFile)}`)))
  }
} else {
  log(magenta(`No configuration provided.\nDefault settings will be used`))
  checkInOut()
}

function loadConfig() {
  import(pathToFileURL(configFile))
    .then(c => {
      log(magenta(`Configuration file ${italic(configFile)} loaded.`))
      const config = c.default
      if (!config) {
        log(red(`Configuration file ${italic(configFile)} does not provide a default export.`))
        return
      } else if (typeof config === 'object' && !Array.isArray(config) && config !== null) {
        log(magenta(`Checking configuration file ${italic(configFile)}...`))
        readConfig(config)
      } else {
        log(red(`Configuration file ${italic(configFile)} must export an object.`))
        return
      }
    })
    .catch(e => {
      log(red(`Error when trying to load ${italic(configFile)}.`))
      return
    })
}

async function readConfig(config) {
  //Check from option
  if ("from" in config) {
    if (typeof config.from === 'string') {
      inputDir = normalizeFolderPath(config.from)
    } else {
      log(red(`${italic(`from`)} option must be a string.\nI received :\n${italic(from)}`))
      return
    }
  }

  //Check to option
  if ("to" in config) {
    if (typeof config.to === 'string') {
      outputDir = normalizeFolderPath(config.to)
      htmlDefault.dir = outputDir
      thumbnailsDefault.dir = outputDir + 'thumbs/'
    } else {
      log(red(`${italic(`to`)} option must be a string.\nI received :\n${italic(to)}`))
      return
    }
  }
  //Further checks will be performed in the checkInOut() function

  //Check exts option
  if ("exts" in config) {
    if (typeof config.exts === 'string') {
      inputImgExtensions = new Set([normalizeExtension(config.exts)])
    } else if (Array.isArray(config.exts)) {
      const exts = config.exts.filter(f => typeof f === 'string')
      if (exts.length == 0) {
        log(red(`${italic('exts')} option does not contain any string.`))
        return
      }
      inputImgExtensions = new Set(exts.map(e => normalizeExtension(e)))
    } else {
      log(red(`${italic('exts')} option must be a string or an array of strings.`))
      return
    }
  }

  //Check formats option
  if ("formats" in config) {
    if (typeof config.formats === 'string') {
      if (AVAILABLE_OUTPUT_IMG_FORMATS.has(normalizeExtension(config.formats))) {
        outputImgFormats = new Set([normalizeExtension(config.formats)])
      } else {
        log(red(`${italic(config.formats)} format is not supported.`))
        return
      }
    } else if (Array.isArray(config.formats)) {
      let formats = config.formats.filter(f => typeof f === 'string')
      if (formats.length == 0) {
        log(red(`${italic('formats')} option does not contain any string.`))
        return
      }
      formats = formats.filter(f => AVAILABLE_OUTPUT_IMG_FORMATS.has(normalizeExtension(f)))
      if (formats.length == 0) {
        log(red(`${italic('formats')} option does not contain any valid format.\nValid formats are ${italic(".avif")}, ${italic(".webp")} or ${italic(".jpg")}.`))
        return
      }
      outputImgFormats = new Set(formats.map(f => normalizeExtension(f)))
    } else {
      log(red(`${italic('formats')} option must be a string or an array of strings.`))
      return
    }
  }

  //Check widths option
  if ("widths" in config) {
    if (typeof config.widths === 'number') {
      if (Math.round(config.widths) < 1) {
        log(red(`${italic('widths')} should be an integer greater than 0.`))
        return
      }
      outputImgWidths = new Set([Math.round(config.widths)])
    } else if (Array.isArray(config.widths)) {
      const widths = config.widths.filter(w => typeof w === 'number' && Math.round(w) > 0)
      if (widths.length == 0) {
        log(red(`${italic('widths')} option does not contain any integer greater than 0.`))
        return
      }
      outputImgWidths = new Set(widths.map(w => Math.round(w)).sort((a, b) => a - b))
    }
  }

  //Check max-height option
  if ("maxHeight" in config) {
    if (typeof config.maxHeight !== 'number' || Math.round(config.maxHeight) < 1) {
      log(red(`${italic('maxHeight')} option must be an integer greater than 0.`))
      return
    }
    outputImgMaxHeight = Math.round(data.maxHeight)
  }

  //Check name option
  if ("name" in config) {
    if (typeof config.name !== 'function') {
      log(red(`${italic('name')} option must be a function.`))
      return
    } else if (typeof config.name('a', 1, 1, 't', 'c', 'd') !== 'string') {
      log(red(`${italic('name')} function must return a string.`))
      return
    }
    processedImgName = config.name
  }

  //Check verbose option
  if ("verbose" in config && typeof config.verbose === "boolean") verbose = config.verbose

  //Check force option
  if ("force" in config && typeof config.force === "boolean") force = config.force

  //Check thumbnails option
  if ("thumbnails" in config) {
    const prop = config.thumbnails
    if (prop === true) {
      thumbnails = thumbnailsDefault
      htmlDefault.thumbnail = true
    } else if (typeof prop === 'object' && !Array.isArray(prop) && prop !== null) {
      thumbnails = thumbnailsDefault
      htmlDefault.thumbnail = true
      if ("to" in prop) {
        if (typeof prop.to === 'string' && prop.to != '') {
          thumbnails.dir = prop.to
        } else {
          log(red(`${italic('to')} property of thumbnails option must be a non empty string.\nI received :\n${italic(prop.to)}`))
          return
        }
      }
      if ("name" in prop) {
        if (typeof prop.name !== 'function') {
          log(red(`${italic('name')} key of ${italic('thumbnails')} option must be a function.`))
          return
        } else if (typeof prop.name('a', 1) !== 'string') {
          log(red(`${italic('name')} key of ${italic('thumbnails')} option must return a string.`))
          return
        }
        thumbnails.name = prop.name
      }
      if ("widths" in prop) {
        if (typeof prop.widths === 'number') {
          if (Math.round(prop.widths) < 1) {
            log(red(`${italic('thumbnails widths')} should be an integer greater than 1.`))
            return
          }
          thumbnails.widths = new Set([Math.round(prop.widths)])
        } else if (Array.isArray(prop.widths)) {
          const widths = prop.widths.filter(w => typeof w === 'number' && Math.round(w) > 0)
          if (widths.length == 0) {
            log(red(`${italic('thumbnails widths')} option does not contain any integer greater than 1.`))
            return
          }
          thumbnails.widths = new Set(widths.map(w => Math.round(w)).sort((a, b) => a - b))
        }
      }
      if ("square" in prop && prop.square === false) thumbnails.square = false
      if ("queries" in prop) {
        if (typeof prop.queries === 'number') {
          if (Math.round(prop.widths) < 1) {
            log(red(`${italic('thumbnails queries')} should be an integer greater than 1.`))
            return
          }
          thumbnails.queries = new Set([Math.round(prop.queries)])
        } else if (Array.isArray(prop.queries)) {
          const queries = prop.queries.filter(w => typeof w === 'number' && Math.round(w) > 0)
          if (queries.length == 0) {
            log(red(`${italic('thumbnails queries')} option does not contain any integer greater than 1.`))
            return
          }
          thumbnails.queries = new Set(queries.map(w => Math.round(w)).sort((a, b) => a - b))
        }
      }
      if (thumbnails.queries.size + 1 != thumbnails.widths.size) {
        log(red(`Number of thumbnails media queries must be equal to the number of thumbnails widths minus one`))
        return
      }
      if ("formats" in prop) {
        if (typeof prop.formats === 'string') {
          if (AVAILABLE_OUTPUT_IMG_FORMATS.has(normalizeExtension(prop.formats))) {
            thumbnails.formats = new Set([normalizeExtension(prop.formats)])
          } else {
            log(red(`${italic(prop.formats)} format is not supported for thumbnails.`))
            return
          }
        } else if (Array.isArray(prop.formats)) {
          const formats = prop.formats.filter(f => typeof f === 'string')
          if (formats.length == 0) {
            log(red(`${italic('thumbnails formats')} option does not contain any string.`))
            return
          }
          thumbnails.formats = new Set(formats.map(f => normalizeExtension(f)))
        } else {
          log(red(`${italic('thumbnails formats')} option must be a string or an array of strings.`))
          return
        }
      }
    }
  }

  if ("html" in config) {
    const prop = config.html
    if (prop === true) {
      html = htmlDefault
    } else if (typeof prop === 'object' && !Array.isArray(prop) && prop !== null) {
      html = htmlDefault
      if ("to" in prop) {
        if (typeof prop.to === 'string' && prop.to != '') {
          html.dir = prop.to
        } else {
          log(red(`${italic('to')} property of html option must be a non empty string.\nI received :\n${italic(prop.to)}`))
          return
        }
      }
      if ("root" in prop) {
        if (typeof prop.root === 'string') {
          html.root = prop.root
        } else {
          log(red(`${italic(`root`)} option must be a string.\nI received :\n${italic(to)}`))
          return
        }
      }
      if ("name" in prop) {
        if (typeof prop.name === 'string' && prop.name != '') {
          html.name = prop.name
        } else {
          log(red(`${italic('name')} property of html option must be a non empty string.\nI received :\n${italic(prop.name)}`))
          return
        }
      }
      if ("wrapper" in prop) {
        if (typeof prop.wrapper === 'string' && prop.wrapper != '') {
          html.wrapper = prop.wrapper
        } else {
          log(red(`${italic('wrapper')} property of html option must be a non empty string.\nI received :\n${italic(prop.wrapper)}`))
          return
        }
      }
      if ("wrapperAttr" in prop) {
        if (typeof prop.wrapperAttr === 'string' && prop.wrapperAttr != '') {
          html.wrapperAttr = prop.wrapperAttr
        } else {
          log(red(`${italic('wrapperAttr')} property of html option must be a non empty string.\nI received :\n${italic(prop.wrapperAttr)}`))
          return
        }
      }
      if ("thumbnail" in prop) {
        if (typeof prop.thumbnail === 'boolean') {
          html.thumbnail = prop.thumbnail && htmlDefault.thumbnail
        } else {
          log(red(`${italic('thumbnail')} property of html option must be boolean.\nI received :\n${italic(prop.thumbnail)}`))
          return
        }
      }
      function check(propertyName) {
        if (typeof prop[propertyName] === 'string' && prop[propertyName] != '') {
          html[propertyName] = _ => prop[propertyName]
          return true
        } else if (typeof prop[propertyName] === 'function' && typeof prop[propertyName]('a', 'd', 'e', 'f') === 'string') {
          html[propertyName] = prop[propertyName]
          return true
        } else {
          log(red(`${italic(propertyName)} property of html option must be a non empty string or a function returning a string.`))
          return false
        }
      }
      const
        propertiesToCheck = ["container", "comment", "class", "title", "alt", "more", "caption", "start", "thumbnailAlt", "thumbnailTitle", "end"].filter(propertyName => propertyName in prop),
        isNotValid = propertyName => !check(propertyName)
      if (propertiesToCheck.some(isNotValid)) return
      if ("width" in prop) {
        if (typeof prop.width !== 'number' || Math.round(prop.width) < 1) {
          log(red(`${italic('width')} property of html option must be an integer greater than 1.`))
          return
        }
        html.width = Math.round(prop.width)
      }
      //Fallback img width should not be greater than the maximum width given by outputImgWidths
      html.width = Math.min(html.width, Math.max(...outputImgWidths))
    }
  }
  if (html !== false) {
    //Force jpg extension to be the last item of the set
    outputImgFormats.delete('.jpg')
    outputImgFormats.add('.jpg')
    if (thumbnails !== false) {
      //Force jpg extension to be the last item of the set
      thumbnails.formats.delete('.jpg')
      thumbnails.formats.add('.jpg')
    }
  }
  checkInOut()
}

function normalizeFolderPath(f) {
  f = f.endsWith('/') ? f : f + '/'
  return f
}

async function checkInOut() {
  // inputDir = normalizeFolderPath(inputDir)
  // outputDir = normalizeFolderPath(outputDir)
  //Check if inputDir exists
  if (fs.existsSync(inputDir)) {
    //If it's a directory
    if (fs.lstatSync(inputDir).isDirectory()) {
      //Check if there is images to processed
      imgToProcess = fs.readdirSync(inputDir).filter(f => inputImgExtensions.has(path.extname(f).toLowerCase()))
      if (imgToProcess.length == 0) {
        log(red(`There is no image to process in ${italic(inputDir)} directory.`))
        return
      }
    } else {
      log(red(`${italic(inputDir)} is not a directory.`))
      return
    }
  } else {
    log(red(`Input directory ${italic(inputDir)} does not exist.`))
    return
  }

  fs.ensureDirSync(outputDir)

  if (thumbnails) {
    thumbnails.dir = normalizeFolderPath(thumbnails.dir)
    fs.ensureDirSync(thumbnails.dir)
  }

  // if (html) {
  //   html.dir = normalizeFolderPath(html.dir)
  //   fs.ensureDirSync(html.dir)
  // }

  await doProcessing()
  if (html !== false) {
    html.dir = normalizeFolderPath(html.dir)
    fs.ensureDirSync(html.dir)
    writeHTML()
    // await writeHTML()
  }

  log(green(`\n***************\n ALL DONE !!!!\n***************`))
}

async function doProcessing() {
  await Promise.all(imgToProcess.map(async (img) => {
    if (verbose) log(magenta(`Processing ${italic(img)}`))
    const
      pipe = sharp(inputDir + img),
      name = path.basename(img, path.extname(img))
    let dims = {}, title = '', creator = '', description = ''
    await pipe.metadata()
      .then(async function (metadata) {
        if (metadata.xmp) {
          const json = new XMLParser().parse(metadata.xmp.toString())
          function search(o) {
            if (typeof o === 'object' && Object.keys(o).length > 0) {
              Object.keys(o).forEach(k => {
                if (k == 'dc:creator') creator = o[k]
                if (k == 'dc:description') description = o[k]
                if (k == 'dc:title') title = o[k]
                search(o[k])
              })
            }
          }
          search(json)
        }
        const
          originalWidth = metadata.width,
          originalHeight = metadata.height
        let
          widthsToProcessed = Array.from(outputImgWidths).filter(w => w < originalWidth && Math.floor(w * originalHeight / originalWidth) < outputImgMaxHeight)
        if (widthsToProcessed.length == 0 && originalHeight > outputImgMaxHeight) {
          widthsToProcessed = [Math.floor(outputImgMaxHeight * originalWidth / originalHeight)]
        }
        if (widthsToProcessed.length == 0) {
          widthsToProcessed = Array.from(outputImgWidths).filter(w => w < originalWidth)
        }
        if (widthsToProcessed.length == 0) {
          widthsToProcessed = [originalWidth]
        }
        await Promise.all(widthsToProcessed.map(async w => {
          /*
          Sharp sometimes makes errors when calculating the height of the resized image.
          For example, with a 3959x5938 image:
          resize(400) 
          gives a 601 pixels height image instead of 600.
          So, we use 
          resize(w, h)
          with the default cover fit option
          https://sharp.pixelplumbing.com/api-resize
          **/
          const
            h = Math.round(w * originalHeight / originalWidth),
            n = processedImgName(name, w, h, title, creator, description),
            subPipe = pipe.clone().resize(w, h),
            promises = []

          dims[w] = h

          if (outputImgFormats.has('.jpg')) {
            if (!fs.existsSync(`${outputDir + n}.jpg`) || force) {
              promises.push(
                subPipe
                  .clone()
                  .jpeg({ quality: 75, mozjpeg: true })
                  .toFile(`${outputDir + n}.jpg`)
                  .then(_ => {
                    if (verbose) log(green(`Image ${n}.jpg has been processed`))
                  })
              )
            } else if (verbose) log(magenta(`Image ${n}.jpg has already been processed`))
          }

          if (outputImgFormats.has('.webp')) {
            if (!fs.existsSync(`${outputDir + n}.webp`) || force) {
              promises.push(
                subPipe
                  .clone()
                  .webp({ quality: 75 })
                  .toFile(`${outputDir + n}.webp`)
                  .then(_ => {
                    if (verbose) log(green(`Image ${n}.webp has been processed`))
                  })
              )
            } else if (verbose) log(magenta(`Image ${n}.webp has already been processed`))
          }

          if (outputImgFormats.has('.avif')) {
            if (!fs.existsSync(`${outputDir + n}.avif`) || force) {
              promises.push(
                subPipe
                  .clone()
                  .avif({ chromaSubsampling: '4:2:0' })
                  .toFile(`${outputDir + n}.avif`)
                  .then(_ => {
                    if (verbose) log(green(`Image ${n}.avif has been processed`))
                  })
              )
            } else if (verbose) log(magenta(`Image ${n}.avif has already been processed`))
          }

          await Promise.all(promises)
        }))

        if (thumbnails !== false) {
          await Promise.all(Array.from(thumbnails.widths).map(async w => {
            const
              subPipe = thumbnails.square ? pipe.clone().resize(w, w) : pipe.clone().resize(w),
              promises = [],
              n = thumbnails.name(name, w, title, creator, description)

            if (thumbnails.formats.has('.jpg')) {
              if (!fs.existsSync(`${thumbnails.dir + n}.jpg`) || force) {
                promises.push(
                  subPipe
                    .clone()
                    .jpeg({ quality: 75, mozjpeg: true })
                    .toFile(`${thumbnails.dir + n}.jpg`)
                    .then(_ => {
                      if (verbose) log(green(`Thumbnail ${n}.jpg has been processed`))
                    })
                )
              } else if (verbose) log(magenta(`Thumbnail ${n}.jpg has already been processed`))
            }

            if (thumbnails.formats.has('.webp')) {
              if (!fs.existsSync(`${thumbnails.dir + n}.webp`) || force) {
                promises.push(
                  subPipe
                    .clone()
                    .webp({ quality: 75 })
                    .toFile(`${thumbnails.dir + n}.webp`)
                    .then(_ => {
                      if (verbose) log(green(`Thumbnail ${n}.webp has been processed`))
                    })
                )
              } else if (verbose) log(magenta(`Thumbnail ${n}.webp has already been processed`))
            }

            if (thumbnails.formats.has('.avif')) {
              if (!fs.existsSync(`${thumbnails.dir + n}.avif`) || force) {
                promises.push(
                  subPipe
                    .clone()
                    .avif({ chromaSubsampling: '4:2:0' })
                    .toFile(`${thumbnails.dir + n}.avif`)
                    .then(_ => {
                      if (verbose) log(green(`Thumbnail ${n}.avif has been processed`))
                    })
                )
              } else if (verbose) log(magenta(`Thumbnail ${n}.avif has already been processed`))
            }
            await Promise.all(promises)
          }))
        }
        imgProcessed[name] = { dims: dims, title: title, creator: creator, description: description }
      })
  }))
}

function writeHTML() {
  let content = '', tab = ''
  const
    imgsLocationDir = outputDir.startsWith(html.root) ? outputDir.replace(html.root, '') : outputDir,
    thumbsLocationsDir = html.thumbnail ? thumbnails.dir.startsWith(html.root) ? thumbnails.dir.replace(html.root, '') : thumbnails.dir : ''
  if (html.wrapper) {
    content += `<${html.wrapper}`
    if (html.wrapperAttr) content += ` ${html.wrapperAttr}`
    content += `>\n`
    tab = '\t'
  }
  const sortedNames = Object.keys(imgProcessed).sort()
  sortedNames.forEach(n => {
    const
      dims = imgProcessed[n].dims,
      widths = Object.keys(dims),
      fallbackWidth = Math.min(html.width, Math.max(...widths)),
      fallbackHeight = dims[fallbackWidth],
      datas = [n, imgProcessed[n].title, imgProcessed[n].creator, imgProcessed[n].description],
      fallbackImg = processedImgName(n, fallbackWidth, fallbackHeight, ...datas.slice(1))
    let contentPart = html.comment(...datas) ? `${tab}<!-- ${html.comment(...datas)} -->\n` : ``
    contentPart += `${tab}<${html.container(...datas)}\n`
    if (html.class(...datas)) contentPart += `class="${html.class(...datas)}" `
    contentPart += `${tab}\t`
    contentPart += (html.container(...datas) == "a") ? `href=` : `data-href=`
    contentPart += `"${imgsLocationDir + fallbackImg}.jpg"\n${tab}\tdata-width="${fallbackWidth}"\n${tab}\tdata-height="${fallbackHeight}"\n`
    if (html.caption(...datas)) contentPart += `${tab}\tdata-caption="${html.caption(...datas)}"\n`
    if (html.title(...datas)) contentPart += `${tab}\tdata-title="${html.title(...datas)}"\n`
    if (html.alt(...datas)) contentPart += `${tab}\tdata-alt="${html.alt(...datas)}"\n`
    if (html.more(...datas)) contentPart += `${html.more(...datas)} `
    contentPart += `${tab}\t>\n`
    if (!(outputImgFormats.size == 1 && widths.length == 1)) {
      let script = `${tab}\t<script type="text/content">\n`
      outputImgFormats.forEach(f => {
        const type = `<source type="image/${f == '.jpg' ? 'jpeg' : f.slice(1)}"`
        widths.forEach((w, id) => {
          const
            h = dims[w],
            name = processedImgName(n, w, h, ...datas.slice(1)),
            srcset = ` srcset="${imgsLocationDir + name + f}"`
          let media = ``
          if (widths.length > 1) {
            media = ` media="`
            media += id == (widths.length - 1) ? `(min-width: ${Number(widths[id - 1]) + 1}px) and (min-height: ${dims[widths[id - 1]] + 1}px)` : `(max-width: ${w}px), (max-height: ${h}px)`
            media += `"`
          }
          script += `${tab}\t\t` + type + srcset + media + `/>\n`
        })
      })
      script += `${tab}\t</script>\n`
      contentPart += script
    }
    if (html.start(...datas)) html += '${tab}\t' + html.start(...datas) + `\n`
    if (html.thumbnail) {
      if (!(thumbnails.formats.size == 1 && thumbnails.widths.size == 1)) {
        let fallbackThumbnail
        contentPart += `${tab}\t<picture>\n`
        thumbnails.formats.forEach(f => {
          const type = `<source type="image/${f == '.jpg' ? 'jpeg' : f.slice(1)}"`
          Array.from(thumbnails.widths).forEach((w, id) => {
            const
              name = thumbnails.name(n, w, ...datas.slice(1)),
              srcset = ` srcset="${thumbsLocationsDir + name + f}"`,
              media = id == 0 ? `` : ` media="(min-width: ${Array.from(thumbnails.queries)[id - 1]}px)"`
            if (id == 0) fallbackThumbnail = name
            contentPart += `${tab}\t\t` + type + srcset + media + '/>\n'
          })
        })
        let attr = ``
        if (html.thumbnailAlt(n, ...datas.slice(1))) attr += ` alt="${html.thumbnailAlt(n, ...datas.slice(1))}"`
        if (html.thumbnailTitle(n, ...datas.slice(1))) attr += ` title="${html.thumbnailTitle(n, ...datas.slice(1))}"`
        contentPart += `${tab}\t${defaultThumb(fallbackThumbnail, n, datas.slice(1))}\n`
        contentPart += `${tab}\t</picture>\n`
      } else {
        const name = thumbnails.name(n, [...thumbnails.widths][0], ...datas.slice(1))
        let attr = ``
        if (html.thumbnailAlt(n, ...datas.slice(1))) attr += ` alt="${html.thumbnailAlt(n, ...datas.slice(1))}"`
        if (html.thumbnailTitle(n, ...datas.slice(1))) attr += ` title="${html.thumbnailTitle(n, ...datas.slice(1))}"`
        contentPart += `${tab}${defaultThumb(name, n, datas.slice(1))}\n`
      }
      function defaultThumb(name, n, datas) {
        let attr = ``
        if (html.thumbnailAlt(n, ...datas)) attr += ` alt="${html.thumbnailAlt(n, ...datas)}"`
        if (html.thumbnailTitle(n, ...datas)) attr += ` title="${html.thumbnailTitle(n, ...datas)}"`
        return `\t<img src="${thumbsLocationsDir + name}.jpg"${attr}/>`
      }
    }
    if (html.end(...datas)) contentPart += '\t' + html.end(...datas) + `\n`
    contentPart += `${tab}</${html.container(...datas)}>\n`
    content += contentPart
  })
  if (html.wrapper) {
    content += `</${html.wrapper}>`
  }
  fs.writeFile(html.dir + html.name, content, 'utf-8')
    .then(log(magenta(`HTML file ${italic(html.name)} has been generated.`)))
    .catch(e => log(red(`Unable to write ${italic(html.name)}.`), e))
}