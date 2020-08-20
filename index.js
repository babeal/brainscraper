const BrainScraper = require("./brain-scraper");
const FileWriter = require("./formatters/csv");

const main = async () => {
  let args = process.argv.slice(2);
  
  console.log(args)

  if (args.length != 3) {
    console.log("Error: script requires three arguments username, password and url.");
    console.log("npm run -- username password packurl")
   
  } else {

    let [username, password, packUrl] = args;

    const scraper = new BrainScraper();

    await scraper.init(new FileWriter());
    await scraper.login(username, password);
    if (packUrl.includes("pack")) {
      await scraper.scrapeDeck(packUrl)
    } else {
      await scraper.scrapePack(packUrl);
    }
  }

  process.exit();

}

main()