const puppeteer = require("puppeteer");
const chalk = require("chalk");

class BrainScraper {
  LOGIN_LINK_SELECTOR = "a.nav-link.login-link";
  LOGIN_EMAIL_ID_SELECTOR = "#email";
  LOGIN_PASSWORD_ID_SELECTOR = "#password";
  LOGIN_BUTTON_ID_SELECTOR = "#login-button";

  PACK_TITLE_SELECTOR = ".market-title";
  PACK_DECK_ANCHOR_SELECTOR = "a.deck-bar-link";

  DECK_TITLE_SELECTOR = "span.deck-name";
  DECK_CARDS_SELECTOR = ".card-table .card";

  CARD_QUESTION_SELECTOR = ".card-question-text";
  CARD_ANSWER_SELECTOR = ".card-answer-text";

  BASE_URL = "https://www.brainscape.com";

  browser;
  page;
  output;

  constructor() {}

  async init(output) {
    this.output = output;

    console.log(chalk.blue("BrainScraper initializing"));

    if (!this.browser) {
      this.browser = await puppeteer.launch();
      this.page = await this.browser.newPage();

      await this.page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    }
  }

  async login(username, password) {
    console.log(chalk.blue("logging in"));

    if (!this.page) {
      throw error("Please call 'await scraper.init()' before logging in");
    }

    await this.page.goto(this.BASE_URL, { waitUntil: "networkidle2" });

    const loginElements = await this.page.$$(this.LOGIN_LINK_SELECTOR);
    if (loginElements.length == 0) {
      console.log("Login link wasn't found");
      return;
    }
    // link may be found but might throw exception because it's not visible. Setting larger viewport works for now.
    await loginElements[0].click();
    await this.page.waitFor(1000);
    await this.page.screenshot({ path: "login.png" });

    await this.page.type(this.LOGIN_EMAIL_ID_SELECTOR, username);
    await this.page.type(this.LOGIN_PASSWORD_ID_SELECTOR, password);
    // await Promise.all([
    //   this.page.waitForNavigation({ waitUntil: "networkidle2" }),
    //   this.page.click("#login-button"),
    // ]);
    await this.page.click(this.LOGIN_BUTTON_ID_SELECTOR);
    await this.page.waitFor(5000);

    await this.page.screenshot({ path: "logged-in.png" });
  }

  async scrapePack(url) {
    console.log(chalk.blue(`loading pack at ${url}`));

    await this.page.goto(url, { waitUntil: "networkidle2" });
    await this.page.screenshot({ path: "pack-url.png" });

    const packTitleRaw = await this.page.$eval(
      this.PACK_TITLE_SELECTOR,
      (node) => node.innerText
    );

    // clean up the title
    const packTitle = packTitleRaw
      .replace(/\n/g, "")
      .replace(/ \b(\w+)\W*$/g, "");

    console.log(chalk.blue(`processing pack: ${packTitle}`));

    const deckUrls = await this.page.$$eval(
      this.PACK_DECK_ANCHOR_SELECTOR,
      (anchors) => anchors.map((n) => n.href)
    );

    console.log(chalk.blue(`deck count: ${deckUrls.length}`));

    // process each deck found in the pack
    for (const deckUrl of deckUrls) {
      await this.scrapeDeck(deckUrl);
    }
    //await this.scrapeDeck(deckUrls[0]);
  }

  async scrapeDeck(url) {
    console.log(chalk.blue(`loading deck at ${url}`));
    await this.page.goto(url, { waitUntil: "networkidle2" });
    await this.page.screenshot({ path: "deck-url.png" });

    const deckTitleRaw = await this.page.$eval(
      this.DECK_TITLE_SELECTOR,
      (node) => node.innerText
    );

    // clean up the title
    const deckTitle = deckTitleRaw.replace(/\n/g, "");

    console.log(chalk.cyan(`processing deck: ${deckTitle}`));

    const cardElementHandles = await this.page.$$(this.DECK_CARDS_SELECTOR);
    const cardContentFutures = cardElementHandles.map(async (elementHandle) =>
      this.scrapeCard(elementHandle)
    );
    const cards = await Promise.all(cardContentFutures);

    await this.output.open(deckTitle);
    for (const card of cards) {
      await this.output.write(card)
    }
    await this.output.close();
  }

  async scrapeCard(elementHandle) {
    const propertySelector = "innerText";
    const questionElementHandle = await elementHandle.$(
      this.CARD_QUESTION_SELECTOR
    );
    const questionJSHandle = await questionElementHandle.getProperty(
      propertySelector
    );
    const question = await questionJSHandle.jsonValue();

    const answerElementHandle = await elementHandle.$(
      this.CARD_ANSWER_SELECTOR
    );
    const answerJSHandle = await answerElementHandle.getProperty(
      propertySelector
    );
    const answer = await answerJSHandle.jsonValue();

    return {
      question,
      answer,
    };
  }
}

module.exports = BrainScraper;
