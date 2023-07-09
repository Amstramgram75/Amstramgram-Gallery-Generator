
const config = {
  from: "work/Basic/",
  to: "docs_dev/assets/img/basic/",
  widths: 2000,
  formats: "jpg",
  force: false,
  verbose: true,
  thumbnails: {
    formats: "jpg",
    name: n => n
  },
  html: {
    to: 'docs_src/html/code/',
    root: 'docs_dev/',
    name: 'demo-basic-gallery.html',
    wrapper: 'div',
    wrapperAttr: 'class="demo-basic-gallery"',
    container: 'div',
    caption: (n, title, creator, description) => `<a href='${description}' target='_blank'>${title} by ${creator}</a>`,
    title: (n, title, creator) => `${title} by ${creator}`,
    thumbnail: true,
    thumbnailAlt: (n, title, creator) => `${title} by ${creator}`,
    thumbnailTitle: _ => `Click to open in fullscreen`
  }
}
export default config