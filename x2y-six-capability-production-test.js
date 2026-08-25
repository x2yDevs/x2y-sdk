const fs = require("fs");
const { X2YSdk } = require("x2y-dev-tools-sdk");

const sdk = new X2YSdk(
  { rateLimitThreshold: 80, predictionWindow: 60000 },
  { targetLanguage: "javascript", rules: ["performance", "idiom", "async"] }
);

const productionCode = `
const express = require("express");
const app = express();

var requestCache = {};
var metrics = [];

app.get("/api/users/:id", async function(req, res) {
  var user = await getUser(req.params.id);
  var orders = await getOrders(user.id);

  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];
    var customer = await getCustomer(order.customerId);
    var element = document.querySelector(".order-" + order.id);
    if (element) { element.textContent = customer.name; }
  }

  return fetch("/api/legacy")
    .then(function(res) { return res.json(); })
    .then(function(data) { return data; });
});
`;

(async () => {
  console.log("🔥 X2Y SDK — CORRECTED PRODUCTION TEST\n");

  // 1. Refactoring Tests
  const idiomSuggestions = await sdk.refactorCode(productionCode);
  const perfSuggestions = await sdk.refactorCode(productionCode);
  const asyncSuggestions = await sdk.refactorCode(productionCode);
  
  console.log("Idiom:", idiomSuggestions.some(s => s.type === "idiom") ? "✅" : "❌");
  console.log("Performance:", perfSuggestions.some(s => s.type === "performance") ? "✅" : "❌");
  console.log("Async:", asyncSuggestions.some(s => s.type === "async") ? "✅" : "❌");

  // 2. File Level Test
  fs.writeFileSync("./temp-prod.js", productionCode);
  const fileSuggestions = await sdk.refactorFile("./temp-prod.js");
  console.log("File-Level:", fileSuggestions.length > 0 ? "✅" : "❌");
  fs.unlinkSync("./temp-prod.js");

  // 3. Traffic & Prediction Tests
  const traffic = [
    { endpoint: "/prod/healthy", method: "GET", statusCode: 200, responseTime: 55, headers: { "x-ratelimit-remaining": "95" } },
    { endpoint: "/prod/slow", method: "GET", statusCode: 200, responseTime: 4500, headers: { "x-ratelimit-remaining": "90" } },
    { endpoint: "/prod/rate-limited", method: "GET", statusCode: 429, responseTime: 450, headers: { "x-ratelimit-remaining": "2" } }
  ];

  for (let i = 0; i < 100; i++) {
    traffic.forEach(t => sdk.recordAPITraffic({ ...t, timestamp: Date.now() }));
  }

  const healthyPred = await sdk.predictAPIIssues("/prod/healthy");
  const slowPred = await sdk.predictAPIIssues("/prod/slow");
  const ratePred = await sdk.predictAPIIssues("/prod/rate-limited");

  console.log("Prediction Differentiation:", healthyPred.riskLevel !== slowPred.riskLevel ? "✅" : "❌");
  console.log("Rate Limit Detection:", ratePred.rateLimitApproaching ? "✅" : "❌");
  console.log("Latency Awareness:", slowPred.riskLevel === "high" ? "✅" : "❌");
  console.log("Confidence Variation:", healthyPred.confidence !== slowPred.confidence ? "✅" : "❌");

  console.log("\n🏁 TEST COMPLETE");
})();
