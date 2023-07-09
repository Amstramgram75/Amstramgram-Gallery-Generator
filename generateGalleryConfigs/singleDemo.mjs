
const config = {
  from: "work/Single/",
  to: "docs_dev/assets/img/single/",
  widths: 2000,
  name: n => n,
  force: false,
  verbose: true,
  thumbnails: {
    widths: 200,
    square: false,
    name: n => n
  },
  html: {
    to: 'docs_src/html/code/',
    root: 'docs_dev/',
    name: 'demo-single-gallery.html',
    wrapper: 'div',
    wrapperAttr: 'class="demo-single-gallery"',
    caption: (n, title, creator, description) => `<a href='${description}' target='_blank'>${title} by ${creator}.</a><br><span style='font-size:0.8em;'>Image type is : <span class='type'></span></span>`,
    title: (n, title, creator) => `${title} by ${creator}`,
    thumbnail: true,
    thumbnailAlt: (n, title, creator) => `${title} by ${creator}`,
    thumbnailTitle: _ => `Click to open in fullscreen`
  }
}
export default config