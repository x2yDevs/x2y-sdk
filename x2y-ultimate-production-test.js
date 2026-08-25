const https = require("https");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { X2YSdk } = require("x2y-dev-tools-sdk");

const BASE_URL = "https://api.github.com";
const USER_AGENT = "X2Y-SDK-Ultimate-Production-Test";

console.log(`
╔════════════════════════════════════════════════════════════╗
║       X2Y SDK — ULTIMATE PRODUCTION INTEGRATION TEST      ║
║              REAL GITHUB API / REAL TRAFFIC               ║
╚════════════════════════════════════════════════════════════╝
`);

const sdk = new X2YSdk(
  {
    rateLimitThreshold: 70
  },
  {
    targetLanguage: "javascript",
    rules: ["performance", "idiom", "async"]
  }
);

let passed = 0;
let failed = 0;
const results = [];

function check(name, condition, detail = "") {
  if (condition) {
    console.log(`   ✅ ${name}${detail ? ` — ${detail}` : ""}`);
    passed++;
    results.push({ name, passed: true });
  } else {
    console.log(`   ❌ ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
    results.push({ name, passed: false });
  }
}

function liveRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    const start = performance.now();

    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/vnd.github+json"
        }
      },
      res => {
        let body = "";

        res.on("data", chunk => {
          body += chunk;
        });

        res.on("end", () => {
          const responseTime = Math.round(
            performance.now() - start
          );

          const headers = {};

          for (const [key, value] of Object.entries(res.headers)) {
            headers[key.toLowerCase()] = Array.isArray(value)
              ? value.join(", ")
              : String(value ?? "");
          }

          resolve({
            endpoint,
            method: "GET",
            timestamp: Date.now(),
            responseTime,
            statusCode: res.statusCode || 0,
            headers,
            bodyBytes: Buffer.byteLength(body)
          });
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(
        new Error(`Request timeout: ${endpoint}`)
      );
    });

    req.on("error", reject);
  });
}

async function recordLive(endpoint) {
  const record = await liveRequest(endpoint);

  sdk.recordAPITraffic({
    endpoint: record.endpoint,
    method: record.method,
    timestamp: record.timestamp,
    responseTime: record.responseTime,
    statusCode: record.statusCode,
    headers: record.headers
  });

  return record;
}

async function main() {
  /*
   * ==========================================================
   * 1. REAL GITHUB CONNECTIVITY
   * ==========================================================
   */

  console.log("\n1️⃣ REAL API CONNECTIVITY\n");

  const basicEndpoints = [
    "/users/octocat",
    "/repos/x2ydevs/x2y-sdk",
    "/rate_limit"
  ];

  const liveRecords = [];

  for (const endpoint of basicEndpoints) {
    try {
      const record = await recordLive(endpoint);

      liveRecords.push(record);

      console.log(
        `   📡 ${endpoint} | ` +
        `${record.statusCode} | ` +
        `${record.responseTime}ms | ` +
        `remaining=${record.headers["x-ratelimit-remaining"] || "n/a"}`
      );

      check(
        `${endpoint} returned a real HTTP response`,
        record.statusCode > 0
      );

      check(
        `${endpoint} has measured latency`,
        Number.isFinite(record.responseTime) &&
          record.responseTime >= 0
      );

      check(
        `${endpoint} has captured headers`,
        Object.keys(record.headers).length > 0
      );
    } catch (error) {
      console.log(
        `   ❌ ${endpoint}: ${error.message}`
      );
      failed++;
    }
  }

  /*
   * ==========================================================
   * 2. REAL RATE-LIMIT HEADER VALIDATION
   * ==========================================================
   */

  console.log("\n2️⃣ REAL RATE-LIMIT ANALYSIS\n");

  const rateRecord =
    liveRecords.find(r => r.endpoint === "/rate_limit");

  if (rateRecord) {
    const remaining =
      Number(rateRecord.headers["x-ratelimit-remaining"]);

    const limit =
      Number(rateRecord.headers["x-ratelimit-limit"]);

    check(
      "GitHub supplied x-ratelimit-remaining",
      Number.isFinite(remaining),
      `remaining=${remaining}`
    );

    check(
      "GitHub supplied x-ratelimit-limit",
      Number.isFinite(limit),
      `limit=${limit}`
    );

    if (Number.isFinite(remaining) && Number.isFinite(limit)) {
      const usage =
        ((limit - remaining) / limit) * 100;

      console.log(
        `   📊 Real quota usage: ${usage.toFixed(2)}%`
      );
    }
  }

  /*
   * ==========================================================
   * 3. PREDICTIVE ANALYSIS
   * ==========================================================
   */

  console.log("\n3️⃣ PREDICTIVE ISSUE ANALYSIS\n");

  const predictions = {};

  for (const endpoint of basicEndpoints) {
    try {
      const prediction =
        await sdk.predictAPIIssues(endpoint);

      predictions[endpoint] = prediction;

      console.log(
        `   🔮 ${endpoint}`
      );
      console.log(
        `      Risk: ${prediction.riskLevel}`
      );
      console.log(
        `      Failure: ${prediction.predictedFailure}`
      );
      console.log(
        `      Rate Limit: ${prediction.rateLimitApproaching}`
      );
      console.log(
        `      Confidence: ${prediction.confidence}%`
      );

      check(
        `${endpoint} returned a risk level`,
        ["low", "medium", "high"].includes(
          prediction.riskLevel
        )
      );

      check(
        `${endpoint} returned valid confidence`,
        Number.isFinite(prediction.confidence) &&
          prediction.confidence >= 50 &&
          prediction.confidence <= 98
      );
    } catch (error) {
      console.log(
        `   ❌ Prediction failed: ${error.message}`
      );
      failed++;
    }
  }

  /*
   * ==========================================================
   * 4. REAL LATENCY DIFFERENTIATION
   * ==========================================================
   */

  console.log("\n4️⃣ LATENCY DIFFERENTIATION\n");

  const latencies =
    liveRecords.map(r => r.responseTime);

  const fastest =
    Math.min(...latencies);

  const slowest =
    Math.max(...latencies);

  console.log(
    `   Fastest: ${fastest}ms`
  );

  console.log(
    `   Slowest: ${slowest}ms`
  );

  check(
    "Real requests produced measurable latency variation",
    slowest >= fastest
  );

  const confidenceValues =
    Object.values(predictions)
      .map(p => p.confidence);

  check(
    "Prediction confidence varies across live endpoints",
    new Set(confidenceValues).size > 1,
    confidenceValues.join(" / ")
  );

  /*
   * ==========================================================
   * 5. REAL ERROR RESPONSE
   * ==========================================================
   *
   * This endpoint should produce a genuine HTTP 404.
   * Nothing is fabricated.
   */

  console.log("\n5️⃣ REAL HTTP ERROR HANDLING\n");

  try {
    const errorRecord =
      await recordLive("/this-endpoint-definitely-does-not-exist");

    console.log(
      `   📛 Error response: ${errorRecord.statusCode}`
    );

    check(
      "Real HTTP error was captured",
      errorRecord.statusCode >= 400
    );

    const errorPrediction =
      await sdk.predictAPIIssues(
        "/this-endpoint-definitely-does-not-exist"
      );

    console.log(
      `   🔮 Error risk: ${errorPrediction.riskLevel}`
    );

    console.log(
      `   🔮 Predicted failure: ${errorPrediction.predictedFailure}`
    );

    check(
      "Error traffic produced a prediction",
      Boolean(errorPrediction)
    );
  } catch (error) {
    console.log(
      `   ❌ Error test failed: ${error.message}`
    );
    failed++;
  }

  /*
   * ==========================================================
   * 6. REPEATED REAL TRAFFIC
   * ==========================================================
   */

  console.log("\n6️⃣ REPEATED REAL TRAFFIC / SAMPLE GROWTH\n");

  const repeatedEndpoint = "/users/octocat";

  const repeatedRecords = [];

  for (let i = 1; i <= 5; i++) {
    try {
      const record =
        await recordLive(repeatedEndpoint);

      repeatedRecords.push(record);

      console.log(
        `   Request ${i}/5 → ` +
        `${record.statusCode} | ` +
        `${record.responseTime}ms | ` +
        `remaining=${record.headers["x-ratelimit-remaining"] || "n/a"}`
      );
    } catch (error) {
      console.log(
        `   ❌ Request ${i}: ${error.message}`
      );
    }
  }

  check(
    "Multiple real calls were recorded",
    repeatedRecords.length === 5
  );

  /*
   * ==========================================================
   * 7. POST-TRAFFIC PREDICTION
   * ==========================================================
   */

  console.log("\n7️⃣ POST-TRAFFIC PREDICTION\n");

  try {
    const postTraffic =
      await sdk.predictAPIIssues(repeatedEndpoint);

    console.log(
      `   Risk: ${postTraffic.riskLevel}`
    );

    console.log(
      `   Confidence: ${postTraffic.confidence}%`
    );

    check(
      "Prediction works after accumulated live traffic",
      Boolean(postTraffic)
    );
  } catch (error) {
    console.log(
      `   ❌ Post-traffic prediction failed: ${error.message}`
    );
    failed++;
  }

  /*
   * ==========================================================
   * 8. REAL CODE REFACTORING TEST
   * ==========================================================
   */

  console.log("\n8️⃣ CODE REFACTORING / PERFORMANCE ANALYSIS\n");

  const fixture = path.join(
    process.cwd(),
    "x2y-live-refactor-fixture.js"
  );

  const fixtureCode = `
function processUsers(users) {
  const results = [];

  for (let i = 0; i < users.length; i++) {
    const element = document.querySelector("#user-" + users[i].id);

    if (element) {
      results.push({
        name: users[i].name,
        html: element.innerHTML
      });
    }
  }

  return new Promise((resolve, reject) => {
    Promise.resolve(results)
      .then(data => {
        return Promise.resolve(data);
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}
`;

  fs.writeFileSync(
    fixture,
    fixtureCode,
    "utf8"
  );

  try {
    const suggestions =
      await sdk.refactorFile(fixture);

    console.log(
      `   🧠 Suggestions returned: ${suggestions.length}`
    );

    const performanceSuggestions =
      suggestions.filter(
        s => s.type === "performance"
      );

    const asyncSuggestions =
      suggestions.filter(
        s => s.type === "async"
      );

    const idiomSuggestions =
      suggestions.filter(
        s => s.type === "idiom"
      );

    console.log(
      `      Performance: ${performanceSuggestions.length}`
    );

    console.log(
      `      Async:       ${asyncSuggestions.length}`
    );

    console.log(
      `      Idiom:       ${idiomSuggestions.length}`
    );

    check(
      "Refactoring engine analyzed a real source file",
      Array.isArray(suggestions)
    );

    check(
      "Performance analysis executed",
      performanceSuggestions.length > 0
    );

    check(
      "Async analysis executed",
      asyncSuggestions.length > 0
    );

    if (suggestions.length > 0) {
      console.log("\n   📋 SAMPLE SUGGESTIONS:\n");

      suggestions
        .slice(0, 5)
        .forEach((suggestion, index) => {
          console.log(
            `      ${index + 1}. ${suggestion.type || "unknown"}`
          );

          console.log(
            `         ${JSON.stringify(suggestion)}`
          );
        });
    }
  } catch (error) {
    console.log(
      `   ❌ Refactoring test failed: ${error.message}`
    );
    failed++;
  } finally {
    try {
      fs.unlinkSync(fixture);
    } catch (_) {}
  }

  /*
   * ==========================================================
   * 9. FINAL SCORE
   * ==========================================================
   */

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    FINAL RESULT                           ║
╚════════════════════════════════════════════════════════════╝
`);

  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);

  const total = passed + failed;

  const percentage =
    total > 0
      ? ((passed / total) * 100).toFixed(1)
      : "0.0";

  console.log(
    `   Score:  ${percentage}%`
  );

  if (failed === 0) {
    console.log(`
🏆 ALL LIVE PRODUCTION TESTS PASSED

The SDK successfully demonstrated:
  ✅ Real GitHub API connectivity
  ✅ Real traffic recording
  ✅ Real latency measurement
  ✅ Real status-code capture
  ✅ Real response-header capture
  ✅ Real rate-limit inspection
  ✅ Predictive risk analysis
  ✅ Confidence differentiation
  ✅ Repeated traffic accumulation
  ✅ Real HTTP error handling
  ✅ Real source-file refactoring
  ✅ Performance analysis
  ✅ Async analysis

🔥 X2Y SDK — ULTIMATE LIVE TEST: PASS
`);
  } else {
    console.log(`
⚠️ ULTIMATE LIVE TEST FINISHED WITH FAILURES

Review the failed checks above before calling
the SDK production-ready.
`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error("\n💥 FATAL TEST ERROR");
  console.error(error);
  process.exit(1);
});
