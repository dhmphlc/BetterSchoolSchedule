const express = require('express');
const scraper = require('./scraper');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to handle scraping
app.get('/scrape', async (req, res) => {
  try {
    const selectedDate = req.query.date;
    const courseYear = req.query.year;

    let {groupOne, groupTwo} = await scraper.scrapeData(selectedDate, courseYear);
    const response = {
      groupOne,
      groupTwo
    };
    // Return the scraping result to the frontend
    res.send(response);
  } catch (error) {
    console.error('Error occurred during scraping:', error);
    res.status(500).send('Error occurred during scraping');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
