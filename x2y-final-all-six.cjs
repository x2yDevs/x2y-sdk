const fs = require("fs");
const path = require("path");

const {
  refactorCode,
  refactorFile,
  predictApiRisk
} = require("./dist");

(async () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🔥 X2Y SDK — FINAL ALL-SIX PRODUCTION TEST          ║
║        Real JavaScript • No TypeScript fixture syntax       ║
╚══════════════════════════════════════════════════════════════╝
`);

  const checks = {
    async: false,
    performance: false,
    idiom: false,
    file: false,
    prediction: false,
    rateLimit: false
  };

  // ------------------------------------------------------------
  // 1. REAL JAVASCRIPT REFACTORING
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 1️⃣ REAL CODE REFACTORING                                   ║
╚══════════════════════════════════════════════════════════════╝
`);

  const productionCode = `
function processUsers(users) {
  var results = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    var element = document.querySelector(
      ".user-" + user.id
    );

    if (element) {
      results.push({
        id: user.id,
        element: element
      });
    }
  }

  var status = document.querySelector("#status");

  return fetch("/api/users")
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      return fetch("/api/orders/" + data.id);
    })
    .then(function(res) {
      return res.json();
    })
    .catch(function(error) {
      console.error(error);
    });
}
`;

  const suggestions = await refactorCode(productionCode);

  console.log("Total suggestions:", suggestions.length);

  const categories = {};

  for (const s of suggestions) {
    categories[s.type] = (categories[s.type] || 0) + 1;

    console.log(`
TYPE: ${s.type}
SEVERITY: ${s.severity}
LINE: ${s.line}
DESCRIPTION: ${s.description}

ORIGINAL:
${s.originalCode}

SUGGESTED:
${s.suggestedCode}
`);
  }

  checks.async = (categories.async || 0) > 0;
  checks.performance = (categories.performance || 0) > 0;
  checks.idiom = (categories.idiom || 0) > 0;

  console.log("Async:", checks.async ? "✅" : "❌");
  console.log("Performance:", checks.performance ? "✅" : "❌");
  console.log("Idiom:", checks.idiom ? "✅" : "❌");

  // ------------------------------------------------------------
  // 2. FILE-LEVEL ANALYSIS
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 2️⃣ FILE-LEVEL PRODUCTION ANALYSIS                          ║
╚══════════════════════════════════════════════════════════════╝
`);

  const fixture = path.join(
    process.cwd(),
    "x2y-production-fixture.js"
  );

  fs.writeFileSync(fixture, productionCode);

  const fileSuggestions = await refactorFile(fixture);

  console.log("File suggestions:", fileSuggestions.length);

  const fileCategories = {};

  for (const s of fileSuggestions) {
    fileCategories[s.type] =
      (fileCategories[s.type] || 0) + 1;
  }

  console.log("File categories:", fileCategories);

  checks.file = fileSuggestions.length > 0;

  console.log(
    "File analysis:",
    checks.file ? "✅ DETECTED" : "❌ NOT DETECTED"
  );

  // ------------------------------------------------------------
  // 3. API PREDICTION — HEALTHY
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 3️⃣ API PREDICTION — HEALTHY                                ║
╚══════════════════════════════════════════════════════════════╝
`);

  const healthy = await predictApiRisk({
    endpoint: "/prod/healthy",
    statusCode: 200,
    latency: 60,
    errorRate: 0.005,
    remainingLimit: 95
  });

  console.log(healthy);

  // ------------------------------------------------------------
  // 4. API PREDICTION — FAILURE
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 4️⃣ API PREDICTION — SERVER FAILURE                         ║
╚══════════════════════════════════════════════════════════════╝
`);

  const failure = await predictApiRisk({
    endpoint: "/prod/server-failure",
    statusCode: 500,
    latency: 400,
    errorRate: 0.75,
    remainingLimit: 90
  });

  console.log(failure);

  // ------------------------------------------------------------
  // 5. API PREDICTION — RATE LIMIT
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 5️⃣ API PREDICTION — RATE LIMIT PRESSURE                    ║
╚══════════════════════════════════════════════════════════════╝
`);

  const rateLimited = await predictApiRisk({
    endpoint: "/prod/rate-limited",
    statusCode: 429,
    latency: 450,
    errorRate: 0.30,
    remainingLimit: 2
  });

  console.log(rateLimited);

  checks.prediction =
    healthy &&
    failure &&
    rateLimited &&
    healthy.riskLevel !== failure.riskLevel &&
    healthy.predictedFailure !== failure.predictedFailure;

  checks.rateLimit =
    rateLimited &&
    rateLimited.rateLimitApproaching === true;

  console.log(
    "Prediction differentiation:",
    checks.prediction ? "✅" : "❌"
  );

  console.log(
    "Rate-limit detection:",
    checks.rateLimit ? "✅" : "❌"
  );

  // ------------------------------------------------------------
  // 6. EXTREME LATENCY
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 6️⃣ EXTREME LATENCY                                         ║
╚══════════════════════════════════════════════════════════════╝
`);

  const slow = await predictApiRisk({
    endpoint: "/prod/slow",
    statusCode: 200,
    latency: 4500,
    errorRate: 0.01,
    remainingLimit: 90
  });

  console.log(slow);

  // ------------------------------------------------------------
  // FINAL
  // ------------------------------------------------------------

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🏆 FINAL RESULTS                         ║
╚══════════════════════════════════════════════════════════════╝
`);

  const passed = Object.values(checks)
    .filter(Boolean)
    .length;

  for (const [name, value] of Object.entries(checks)) {
    console.log(
      `${value ? "✅" : "❌"} ${name}`
    );
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECKS PASSED: ${passed}/${Object.keys(checks).length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (passed === Object.keys(checks).length) {
    console.log("🏆 X2Y PASSED THE FINAL ALL-SIX TEST");
    console.log("All six advertised capabilities demonstrated.");
  } else {
    console.log("⚠️ X2Y DID NOT PASS ALL SIX CHECKS");
    console.log("Investigate the failed capability above.");
  }

  try {
    fs.unlinkSync(fixture);
  } catch (_) {}

  console.log("\n🏁 FINAL TEST COMPLETE");
})();
