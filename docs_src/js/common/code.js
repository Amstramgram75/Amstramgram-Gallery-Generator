
//Called on  window load event
//Insert a COPY button in each code container with a copy class
//Copy code to clipboard when button is clicked
export default function code() {
  const
    w = window,
    d = document
  Array.from(d.querySelectorAll('div.code.copy')).forEach(div => {
    div.insertAdjacentHTML('afterbegin', '<div class="icon-copy"><div class="background"></div><div class="foreground"></div></div>')
    div.querySelector('.icon-copy').addEventListener('click', _ => {
      if (!navigator.clipboard) {
        try {
          const range = d.createRange()
          range.selectNode(div.querySelector('code'))
          w.getSelection().removeAllRanges() // clear current selection
          w.getSelection().addRange(range) // to select text
          d.execCommand("copy")
          w.getSelection().removeAllRanges()// to deselect
          done()
        } catch (e) {
          error()
        }
      } else {
        navigator.clipboard
          .writeText(div.querySelector('code').innerText)
          .then(done, error)
      }
      function done() {
        div.querySelector('.icon-copy').classList.add('clicked')
        setTimeout(_ => div.querySelector('.icon-copy').classList.remove('clicked'), 2000)
      }
      function error() {
        alert("Sorry but I'm unable to copy!!!")
      }
    })
  })
  /*
  The code is revealed by transitioning its max-height property,
  initially set to 0.
  When revealed, the pre container max-height is transitioned 
  to its scrollHeight updated on windows resize event
  and stored in its data-height attribute.
*/
  if (d.querySelectorAll('.show-code').length > 0) {
    Array.from(d.querySelectorAll('.show-code')).forEach(b => {
      b.addEventListener('change', function () {
        if (this.checked) {//Show code
          this.nextElementSibling.style.maxHeight = 'calc(100vh - 160px)'
        } else {//Hide code
          this.nextElementSibling.removeAttribute('style')
        }
      })
    })
  }

}