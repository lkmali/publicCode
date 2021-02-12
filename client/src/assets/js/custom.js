function copyToClipboard(e) {
					  
    var
      t = e.target, 
      c = t.dataset.copytarget,
      inp = (c ? document.querySelector(c) : null);
    console.log(inp);
    if (inp && inp.select) {
      inp.select();
      try {
        document.execCommand('copy');
        inp.blur();
        t.classList.add('copied');
        setTimeout(function() {
          t.classList.remove('copied');
        }, 1500);
      } catch (err) {
        alert('please press Ctrl/Cmd+C to copy');
      }

    }

  }