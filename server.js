const puppeteer = require("puppeteer");
const fs = require("fs");

const URL = "https://www.flipkart.com/search?q=mobiles";

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  // Go to the page and wait for network to be idle
  await page.goto(URL, { waitUntil: "networkidle0" });

  // Wait for the product price container to load
  await page.waitForSelector("div.Nx9bqj._4b5DiR", { timeout: 60000 });

  // Extract product prices and names
  const products = await page.evaluate(() => {
    const productList = [];
    const productElements = document.querySelectorAll("div.yKfJKb"); // Main product container

    productElements.forEach((el) => {
      const name = el.querySelector("div.KzDlHZ")?.textContent?.trim(); // Product name
      const discountPrice = el
        .querySelector("div.Nx9bqj._4b5DiR")
        ?.textContent?.trim(); // Discounted price
      const originalPrice = el
        .querySelector("div.yRaY8j.ZYYwLA")
        ?.textContent?.trim(); // Original price

      if (name && discountPrice) {
        productList.push({
          name: name,
          discountPrice: discountPrice,
          originalPrice: originalPrice || "Not available",
        });
      }
    });

    return productList;
  });

  console.log(products);

  // Save to file
  if (products.length === 0) {
    console.log(
      "No products found. Check the page structure and CSS selectors."
    );
  } else {
    fs.writeFile("products.txt", JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error("File Write Error:", err);
      } else {
        console.log("Products saved successfully!");
      }
    });
  }

  await browser.close();
})();
