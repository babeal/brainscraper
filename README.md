# Brainscraper

This is a quick and dirty scraping mechanism for exporting packs/decks from https://www.brainscape.com. It uses pupeteer to log into the site, then navigate to the pack url. Then for each deck, iterates the cards extracting question and answer and finally exporting to a csv file per pack. Also works with deck urls. If you don't like passing a user name and password, or are using one of the third party auth methods then fork/modify it to use the cookie store of your favorite browser.  

## How to use

`npm install`

`npm start -- <username> <password> <packurl>`

example of pack url - https://www.brainscape.com/l/dashboard/learn-aws-3770946
