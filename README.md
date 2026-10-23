# Typeplayer

A small typing test that looks like an old Linux terminal. Pick 30 or 60 seconds, start typing and the timer starts; when time is up you see your WPM and accuracy.

Live version: [TypePlayer](https://typeplayer.netlify.app/)

## Run it locally

Plain HTML, CSS and JavaScript, no build step and nothing to install. Open `app/index.html` in a browser:

```bash
open app/index.html
```

## Keys

- just type: the first keystroke starts the test
- `backspace`: delete a character, `option+backspace` / `ctrl+backspace`: delete a word
- `←` / `→` (or click `30s` / `60s`): choose the test time, before you start or after the results
- `tab`: restart at any time, `enter`: go again after the results

Your last score for each time (and the time you picked) is kept in this browser (localStorage), so the results show whether you did better or worse than last time.
