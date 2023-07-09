
//Called on window load event
export default function main() {
  const
    w = window,
    d = document,
    html = d.querySelector('html')


  d.querySelector('link[href="css/main.css"]').removeAttribute('onload')
  
  /*
    .loaded class is added to html.
    It hides the loader, 
    reveals the body by transitioning its opacity from 0 to 1
    and blocks animation on body elements.
    The class is removed at the end of the transition.
  */
  html.addEventListener('transitionend', function clean() {
    html.classList.remove('loading')
    html.classList.remove('loaded')
    html.removeEventListener('transitionend', clean)
  })
  html.classList.add('loaded')

  w.addEventListener('scroll', _ => {
    if (d.documentElement.scrollTop > 400) {
      d.querySelector('.up').classList.add('show')
    } else {
      d.querySelector('.up').classList.remove('show')
    }
  })
  d.querySelector('.up').addEventListener('click', _ => {
    w.scrollTo(0, 0)
  })
}