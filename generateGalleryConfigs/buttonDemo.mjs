
const config = {
  from: "work/Button/",
  to: "docs_dev/assets/img/button/",
  widths: 2000,
  force: false,
  verbose: true,
  html: {
    to: 'docs_src/html/toRender/',
    root: 'docs_dev/',
    name: 'demo-button-gallery-content.html',
    wrapper: 'div',
    wrapperAttr: 'class="demo-button-gallery-content" style="display: none;"',
    caption: (n, title, creator, description) => `<a href='${description}' target='_blank'>${title} by ${creator}.</a><br><span style='font-size:0.8em;'>Image type is : <span class='type'></span></span>`,
    title: (n, title, creator) => `${title} by ${creator}`
  }
}
export default config