
const config = {
  from: "work/Responsive/",
  to: "docs_dev/assets/img/responsive/",
  force: false,
  verbose: true,
  thumbnails: true,
  html: {
    to: 'docs_src/html/code/',
    root: 'docs_dev/',
    name: 'demo-responsive-gallery.html',
    wrapper: 'div',
    wrapperAttr: 'class="demo-responsive-gallery"',
    caption: (n, title, creator, description) => `<a href='${description}' target='_blank'>${title} by ${creator}.</a><br><span style='font-size:0.8em;'>Intrinsic dimensions of the loaded <span class='type' style='font-weight:bold'></span>image : <span class='dim'></span></span>`,
    title: (n, title, creator) => `${title} by ${creator}`,
    thumbnail: true,
    thumbnailAlt: (n, title, creator) => `${title} by ${creator}`,
    thumbnailTitle: _ => `Click to open in fullscreen`
  }
}
export default config