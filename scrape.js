const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const puppeteer = require('puppeteer'); 

async function getDataFromFlipkart(product, company) {

    const baseURL = new URL('https://www.flipkart.com/search');
    baseURL.searchParams.append('q', `${company} ${product}`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseURL, {
        waitUntil: 'networkidle2',
    });

    const html = await page.content();
    await browser.close();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const data = [];
    const result = document.querySelectorAll('a._1fQZEK');

    result.forEach(function (val) {

        let obj = {}
        obj.link = 'https://www.flipkart.com' + val.href;

        const imgDiv = val.querySelector(".CXW8mj");
        if(imgDiv == null){
            return;
        }
        const img = imgDiv.getElementsByClassName("_396cs4 _3exPp9")[0];
        obj.img = img.src;


        const dataDiv = val.querySelector("._3pLy-c");
        if(dataDiv == null){
            return;
        }
        const detailsDiv = dataDiv.children[0];
        const priceDiv = dataDiv.children[1];

        if(priceDiv == null){
            return;
        }
        const price = priceDiv.querySelector("._30jeq3._1_WHN1")
        obj.price = price.textContent;


        obj.name = detailsDiv.children[0].textContent;
        const ratingDiv = detailsDiv.children[1].querySelector("._3LWZlK");
        if(ratingDiv == null){
            return;
        }
        obj.rating = ratingDiv.textContent;

        data.push(obj);
    })

    return data;
}

async function getDataFromAmazon(product, company) {
    const baseURL = new URL('https://www.amazon.in/s');
    baseURL.searchParams.append('k', `${company} ${product}`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseURL, {
        waitUntil: 'networkidle2',
    });

    const html = await page.content();
    await browser.close();


    const dom = new JSDOM(html);
    const document = dom.window.document;
    const data = [];

    const results = document.querySelectorAll("div.s-card-container > div.a-section > div.sg-row");
    results.forEach(function (val) {
        let obj = {};

        const img = val.children[0].querySelector('div.sg-col-inner > div.s-product-image-container > div.aok-relative div.a-section > img.s-image');
        obj.img = img.src;

        const mainContent = val.querySelector("div.s-list-col-right > div.sg-col-inner > div.a-section");

        const link = mainContent.querySelector("div.sg-row").children[0].querySelector('div.sg-col-inner > div.s-price-instructions-style');
        if (link != null) {
            const productLink = link.querySelector('div.a-color-base > a.a-size-base');
            if(productLink == null){
                return;
            }
            obj.link = 'https://www.amazon.in' + productLink.href

            const price = link.querySelector('div.a-color-base > a.a-size-base > span.a-price > span.a-offscreen').textContent;
            obj.price = price;
            
            const rating = mainContent.querySelector('div.a-spacing-top-micro > div.a-row').children[0];
            obj.rating = rating.getAttribute('aria-label');

            const name = mainContent.querySelector('div.s-title-instructions-style > h2.a-size-mini > a.a-link-normal > span.a-size-medium').textContent;
            obj.name = name;

            data.push(obj);
        }

    })

    return data;
}

async function getDataFromCroma(product, company) {
    const baseURL = new URL('https://www.croma.com/search');
    baseURL.searchParams.append('q', `${company} ${product}`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(baseURL, {
        waitUntil: 'networkidle2',
    });

    await autoScroll(page);

    await page.waitForSelector('.product-item');
    const data = await page.evaluate(() => {
        let data = [];
        const mainContainer = document.querySelector('.mainContainer')
        const container = mainContainer.querySelector(".container");
        const result = container.querySelector('.two-col-rignt');
        const result2 = result.querySelector('.content-wrap');
        const productList = result2.querySelector('.product-list');
        const itemList = productList.querySelectorAll('.product-item');


        itemList.forEach(function (item) {
            let obj = {};
            const productContainer = item.querySelector('.cp-product');
            const link = productContainer.querySelector('div.product-img > a');

            obj.link = link.href;
            const img = link.children[0]
            obj.img = img.getAttribute('src');

            const title = productContainer.querySelector('div.product-info h3.product-title > a');
            obj.name = title.textContent;

            const price = productContainer.querySelector('div.price-rating-wrap span.new-price > span.amount');
            obj.price = price.textContent;

            const rating = productContainer.querySelector('div.product-info div.cp-rating span.MuiRating-root');
            obj.rating = rating.getAttribute('aria-label');

            data.push(obj);

        })

        return data;
    })

    await browser.close();
    return data;

}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}


module.exports = {
    getDataFromFlipkart,
    getDataFromAmazon,
    getDataFromCroma
}