# Typeplayer

A small typing test that looks like an old Linux terminal. Start typing and the timer starts; finish the text to see your WPM and accuracy.

Live version: [TypePlayer](https://typeplayer.netlify.app/)

## Run it locally

Plain HTML, CSS and JavaScript, no build step and nothing to install. Open `app/index.html` in a browser:

```bash
open app/index.html
```

## Keys

- just type: the first keystroke starts the test
- `backspace`: delete a character, `option+backspace` / `ctrl+backspace`: delete a word
- `tab`: restart at any time, `enter`: go again after the results

Your last score is kept in this browser (localStorage), so the results show whether you did better or worse than last time.

### Inspiration
The youtuber [codynn](https://www.youtube.com/@codynn) made a front-end typing tester which the first version expanded upon.
