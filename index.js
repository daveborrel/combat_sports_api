const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000;
const URL = 'https://www.espn.com/mma/schedule';

const fights = [];

axios(URL)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);

        $('.Table__TR.Table__TR--sm.Table__even', html).each(function () {
            const fightName = $(this).children('.event__col.Table__TD').text();
            const url = $(this).find('a').attr('href');
            const dateString = $(this).find('span').text();
            const timeString = $(this).children('.date__col.Table__TD').find('a').text();

            const dateObject = getDateObject(dateString, timeString)
            let localTimeString = dateObject.toLocaleTimeString();

            let currentDate = new Date();
            if (dateObject > currentDate) {
                fights.push({
                    title: fightName,
                    date: dateObject.toDateString(),
                    time: localTimeString,
                    url: ensureHttps(url),
                    promotion: getPromotionName(fightName, url),
                })
            }
        });
    }).catch(err => console.log(err));

app.listen(PORT, () => console.log(`server running on port: ${PORT}`));

app.get('/', (req, res) => {
    res.json("Combat sports API");
})

app.get('/events', (req, res) => {
    res.json(fights);
})

app.get('/events/:promotion', (req, res) => {
    const promotion = req.params.promotion;
    const filteredFights = fights.filter(fight => fight.promotion === promotion);
    res.json(filteredFights)
})

function getDateObject(dateString, timeString) {
    let currentYear = new Date().getFullYear();
    let dateTimeString = `${dateString} ${currentYear} ${timeString}`;
    return new Date(dateTimeString);
}

function getPromotionName(fightName, url) {

    if (!url) {
        return checkLeaguePresence(fightName);
    }

    let truncatedString = url.replace(/\/mma\/fightcenter\/_\/id\/\d{9}\/league\//, '');

    if (truncatedString.length === 0) {
        return checkLeaguePresence(fightName);
    }

    return truncatedString.toUpperCase();
}

function checkLeaguePresence(fightTitle) {
    const leagues = ["UFC", "PFL", "ONE", "Invicta FC"];

    for (let league of leagues) {
        if (fightTitle.includes(league)) {
            return league;
        }
    }

    return null;
}

function ensureHttps(url) {
    // Check if url is defined
    if (!url) {
        return '';
    }

    // Check if the URL starts with 'http://' or 'https://'
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Prepend the domain if it's a relative URL
        return 'https://www.espn.com' + url; // Replace 'www.example.com' with the actual domain
    }

    // Replace 'http://' with 'https://'
    return url.replace(/^http:\/\//i, 'https://');
}