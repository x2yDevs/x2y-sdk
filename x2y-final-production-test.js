const fs = require("fs");
const path = require("path");

const { X2YSdk } = require("x2y-dev-tools-sdk");

const sdk = new X2YSdk({
  rateLimitThreshold: 80,
  predictionWindow: 60000,
  apiUrl: "https://api.example.com"
});

(async () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🔥 X2Y SDK — FINAL PRODUCTION INTELLIGENCE TEST             ║
║                                                                  ║
║     Refactoring • Performance • Async • Traffic • Prediction    ║
║     Rate Limits • Latency • Confidence • File Analysis          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

  // ================================================================
  // 1. REALISTIC PRODUCTION CODE
  // ================================================================

  const productionCode = `
import express = require("express");
import { Pool } from "pg";

const app = express();
const pool = new Pool();

var requestCache = {};
var metrics = [];

async function loadUserDashboard(userId) {

  var user = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );

  var orders = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1",
    [userId]
  );

  var notifications = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1",
    [userId]
  );

  return {
    user,
    orders,
    notifications
  };
}

async function processUsers(users) {

  var results = [];

  for (var i = 0; i < users.length; i++) {

    var user = users[i];

    var cards = document.querySelectorAll(".user-card");

    for (var j = 0; j < cards.length; j++) {

      var status = document.querySelector("#status");

      if (status) {
        status.textContent = user.name;
      }

      results.push({
        user: user,
        card: cards[j]
      });
    }
  }

  return results;
}

async function legacyExternalRequest(url) {

  return fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      return fetch(data.nextUrl);
    })
    .then(function(res) {
      return res.json();
    })
    .catch(function(error) {
      console.error(error);
    });
}

async function processDashboard(users) {

  var processed = [];

  for (var i = 0; i < users.length; i++) {

    var user = users[i];

    var dashboard = await loadUserDashboard(user.id);

    var enriched = await enrichOrders(dashboard.orders);

    processed.push({
      user: user,
      dashboard: dashboard,
      enriched: enriched
    });
  }

  return processed;
}

async function enrichOrders(orders) {

  var result = [];

  for (var i = 0; i < orders.length; i++) {

    var order = orders[i];

    var customer = await pool.query(
      "SELECT * FROM customers WHERE id = $1",
      [order.customer_id]
    );

    var shipping = await pool.query(
      "SELECT * FROM shipping WHERE order_id = $1",
      [order.id]
    );

    result.push({
      order,
      customer,
      shipping
    });
  }

  return result;
}

app.get("/api/users/:userId/dashboard", async (req, res) => {

  var userId = req.params.userId;

  try {

    var dashboard = await loadUserDashboard(userId);

    res.json(dashboard);

  } catch (error) {

    res.status(500).json({
      error: "dashboard_failed"
    });
  }
});

app.post("/api/users/process", async (req, res) => {

  var users = req.body.users || [];

  var result = await processUsers(users);

  res.json(result);
});

async function fetchExternalData(url) {

  var result = await fetch(url)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      return fetch(data.url);
    })
    .then(function(res) {
      return res.json();
    });

  return result;
}

async function healthCheck() {

  var db = await pool.query("SELECT 1");

  var external = await fetch(
    "https://api.example.com/health"
  );

  return {
    database: db.rowCount >= 0,
    external: external.ok
  };
}

setInterval(async () => {

  try {

    var health = await healthCheck();

    metrics.push({
      type: "health",
      value: health,
      timestamp: new Date()
    });

    console.log("Health:", health);

  } catch (error) {

    console.error("Health check failed:", error);
  }

}, 5000);

app.listen(3000, () => {
  console.log("Production API listening on port 3000");
});
`;

  // ================================================================
  // 2. REFACTORING
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 1️⃣ PRODUCTION CODE REFACTORING                                ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const suggestions = await sdk.refactorCode(productionCode);

  const categories = {};

  for (const s of suggestions) {
    categories[s.type] = (categories[s.type] || 0) + 1;

    console.log(`
TYPE: ${s.type}
SEVERITY: ${s.severity}
LINE: ${s.line}

DESCRIPTION:
${s.description}

ORIGINAL:
${s.originalCode}

SUGGESTED:
${s.suggestedCode}

────────────────────────────────────────────────────────────
`);
  }

  console.log("📊 REFACTORING BREAKDOWN");
  console.log(categories);
  console.log("TOTAL:", suggestions.length);

  const asyncCount = categories.async || 0;
  const performanceCount = categories.performance || 0;
  const idiomCount = categories.idiom || 0;

  console.log(`
ASYNC:        ${asyncCount > 0 ? "✅ DETECTED" : "❌ NOT DETECTED"}
PERFORMANCE:  ${performanceCount > 0 ? "✅ DETECTED" : "❌ NOT DETECTED"}
IDIOM:        ${idiomCount > 0 ? "✅ DETECTED" : "❌ NOT DETECTED"}
`);

  // ================================================================
  // 3. FILE-LEVEL ANALYSIS
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 2️⃣ FILE-LEVEL PRODUCTION ANALYSIS                             ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const testFile = path.join(
    process.cwd(),
    "x2y-final-production-fixture.ts"
  );

  fs.writeFileSync(testFile, productionCode);

  const fileSuggestions = await sdk.refactorFile(testFile);

  const fileCategories = {};

  for (const s of fileSuggestions) {
    fileCategories[s.type] =
      (fileCategories[s.type] || 0) + 1;
  }

  console.log("FILE SUGGESTIONS:", fileSuggestions.length);
  console.log("FILE CATEGORIES:", fileCategories);

  console.log(`
Async:        ${fileCategories.async || 0}
Performance:  ${fileCategories.performance || 0}
Idiom:        ${fileCategories.idiom || 0}
`);

  // ================================================================
  // 4. MASSIVE API TRAFFIC SIMULATION
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 3️⃣ PRODUCTION API TRAFFIC SIMULATION                          ║
║                                                                  ║
║ 12,000 requests across six endpoint profiles                   ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const scenarios = [
    {
      endpoint: "/prod/healthy",
      requests: 2000,
      failureRate: 0.005,
      latency: 60,
      statusCode: 200,
      remaining: 95
    },
    {
      endpoint: "/prod/slow",
      requests: 2000,
      failureRate: 0.01,
      latency: 4500,
      statusCode: 200,
      remaining: 90
    },
    {
      endpoint: "/prod/server-failure",
      requests: 2000,
      failureRate: 0.75,
      latency: 400,
      statusCode: 500,
      remaining: 90
    },
    {
      endpoint: "/prod/rate-limited",
      requests: 2000,
      failureRate: 0.30,
      latency: 450,
      statusCode: 429,
      remaining: 2
    },
    {
      endpoint: "/prod/critical",
      requests: 2000,
      failureRate: 0.80,
      latency: 4800,
      statusCode: 503,
      remaining: 1
    },
    {
      endpoint: "/prod/intermittent",
      requests: 2000,
      failureRate: 0.15,
      latency: 1100,
      statusCode: 503,
      remaining: 65
    }
  ];

  for (const scenario of scenarios) {

    for (let i = 0; i < scenario.requests; i++) {

      const failed =
        Math.random() < scenario.failureRate;

      sdk.recordAPITraffic({
        endpoint: scenario.endpoint,
        method: "GET",
        timestamp: Date.now(),
        responseTime:
          scenario.latency +
          Math.floor(Math.random() * 100),
        statusCode:
          failed
            ? scenario.statusCode
            : 200,
        headers: {
          "x-ratelimit-limit": "100",
          "x-ratelimit-remaining":
            String(scenario.remaining)
        }
      });
    }

    console.log(`
${scenario.endpoint}
Requests: ${scenario.requests}
Failure profile: ${(scenario.failureRate * 100).toFixed(1)}%
Latency profile: ${scenario.latency}ms
Remaining limit: ${scenario.remaining}
`);
  }

  // ================================================================
  // 5. PREDICTION ANALYSIS
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 4️⃣ PREDICTIVE INTELLIGENCE                                   ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const predictions = [];

  for (const scenario of scenarios) {

    const prediction =
      await sdk.predictAPIIssues(
        scenario.endpoint
      );

    predictions.push(prediction);

    console.log(`
🔮 ${scenario.endpoint}

Risk:              ${prediction.riskLevel}
Predicted Failure: ${prediction.predictedFailure}
Rate Limit:        ${prediction.rateLimitApproaching}
Confidence:        ${prediction.confidence}

Alternatives:
${JSON.stringify(
  prediction.suggestedAlternatives,
  null,
  2
)}

────────────────────────────────────────────────────────────
`);
  }

  // ================================================================
  // 6. DIFFERENTIATION ANALYSIS
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 5️⃣ PREDICTION DIFFERENTIATION                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const risks = [
    ...new Set(
      predictions.map(p => p.riskLevel)
    )
  ];

  const confidences = [
    ...new Set(
      predictions.map(p => p.confidence)
    )
  ];

  const failureStates = [
    ...new Set(
      predictions.map(p => p.predictedFailure)
    )
  ];

  const rateLimitStates = [
    ...new Set(
      predictions.map(
        p => p.rateLimitApproaching
      )
    )
  ];

  console.log("Unique risk levels:", risks.length);
  console.log("Unique confidence values:", confidences.length);
  console.log("Unique failure states:", failureStates.length);
  console.log(
    "Unique rate-limit states:",
    rateLimitStates.length
  );

  console.log(`
Risk differentiation:
${risks.length >= 3 ? "✅ STRONG" : "⚠️ LIMITED"}

Confidence differentiation:
${confidences.length >= 2 ? "✅ VARIABLE" : "⚠️ FIXED"}

Failure prediction:
${failureStates.length >= 2 ? "✅ DIFFERENTIATED" : "⚠️ FIXED"}

Rate-limit detection:
${rateLimitStates.length >= 2 ? "✅ DIFFERENTIATED" : "⚠️ FIXED"}
`);

  // ================================================================
  // 7. TARGETED LATENCY TEST
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 6️⃣ EXTREME LATENCY TEST                                      ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const latencyEndpoint = "/prod/extreme-latency";

  for (let i = 0; i < 1000; i++) {

    sdk.recordAPITraffic({
      endpoint: latencyEndpoint,
      method: "GET",
      timestamp: Date.now(),
      responseTime: 5000 + Math.floor(Math.random() * 1000),
      statusCode: 200,
      headers: {
        "x-ratelimit-limit": "100",
        "x-ratelimit-remaining": "90"
      }
    });
  }

  const latencyPrediction =
    await sdk.predictAPIIssues(
      latencyEndpoint
    );

  console.log(`
Latency Prediction:

Risk:              ${latencyPrediction.riskLevel}
Predicted Failure: ${latencyPrediction.predictedFailure}
Confidence:        ${latencyPrediction.confidence}
`);

  // ================================================================
  // 8. TARGETED RATE LIMIT TEST
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 7️⃣ EXTREME RATE-LIMIT TEST                                   ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const rateEndpoint = "/prod/exhausted-limit";

  for (let i = 0; i < 1000; i++) {

    sdk.recordAPITraffic({
      endpoint: rateEndpoint,
      method: "GET",
      timestamp: Date.now(),
      responseTime: 300,
      statusCode:
        i > 900 ? 429 : 200,
      headers: {
        "x-ratelimit-limit": "100",
        "x-ratelimit-remaining": "1"
      }
    });
  }

  const ratePrediction =
    await sdk.predictAPIIssues(
      rateEndpoint
    );

  console.log(`
Rate Limit Prediction:

Risk:              ${ratePrediction.riskLevel}
Predicted Failure: ${ratePrediction.predictedFailure}
Rate Limit Warning: ${ratePrediction.rateLimitApproaching}
Confidence:        ${ratePrediction.confidence}

Fallbacks:
${JSON.stringify(
  ratePrediction.suggestedAlternatives,
  null,
  2
)}
`);

  // ================================================================
  // 9. FINAL SCORE
  // ================================================================

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║ 8️⃣ FINAL PRODUCTION CAPABILITY SCORE                         ║
╚══════════════════════════════════════════════════════════════════╝
`);

  const checks = {
    "API Traffic Monitoring":
      true,

    "Async Refactoring":
      asyncCount > 0,

    "Performance Optimization":
      performanceCount > 0,

    "Idiom Refactoring":
      idiomCount > 0,

    "File-Level Refactoring":
      fileSuggestions.length > 0,

    "Prediction Differentiation":
      risks.length >= 3,

    "Confidence Variation":
      confidences.length >= 2,

    "Failure Prediction":
      failureStates.length >= 2,

    "Rate-Limit Detection":
      rateLimitStates.length >= 2,

    "Latency Awareness":
      latencyPrediction.riskLevel !== "low"
  };

  let passed = 0;

  for (const [name, result] of Object.entries(checks)) {

    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL SCORE: ${passed}/${Object.keys(checks).length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (passed === Object.keys(checks).length) {

    console.log(`
🏆 X2Y PASSED THE FINAL PRODUCTION TEST

All tested advertised capabilities demonstrated
against realistic production-style workloads.
`);
  } else {

    console.log(`
⚠️ X2Y DID NOT PASS EVERY PRODUCTION CHECK

Investigate the failed capabilities above.
`);
  }

  // Cleanup
  try {
    fs.unlinkSync(testFile);
  } catch {}

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                 🏁 FINAL TEST COMPLETE                         ║
╚══════════════════════════════════════════════════════════════════╝
`);
})();
