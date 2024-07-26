const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const PORT = 8000;
const URL = 'https://www.espn.com/mma/schedule/_/league/ufc';

axios(URL)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const fights = [];

        // AnchorLink works

        $('.Table__TR.Table__TR--sm.Table__even', html).each(function () {
            const fight_name = $(this).children('.event__col.Table__TD').text();
            const url = $(this).find('a').attr('href');
            const date = $(this).find('span').text();

            fights.push({
                title: fight_name,
                date: date,
                url: url
            })
        });

        console.log(fights);

    }).catch(err => console.log(err));

app.listen(PORT, () => console.log(`server running on port: ${PORT}`));