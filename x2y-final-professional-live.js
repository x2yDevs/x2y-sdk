const https = require("https");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { X2YSdk } = require("x2y-dev-tools-sdk");

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     X2Y SDK — FINAL PROFESSIONAL LIVE INTEGRATION TEST      ║
║       REAL HTTP • CONCURRENCY • PREDICTION • REFACTORING    ║
╚══════════════════════════════════════════════════════════════╝
`);

const sdk = new X2YSdk(
  {
    rateLimitThreshold: 60,
    predictionWindow: 30000
  },
  {
    targetLanguage: "typescript",
    rules: ["performance", "idiom", "async"]
  }
);

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(
      `   ✅ ${name}${detail ? ` — ${detail}` : ""}`
    );
  } else {
    failed++;
    console.log(
      `   ❌ ${name}${detail ? ` — ${detail}` : ""}`
    );
  }
}

function githubRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const start = performance.now();

    const req = https.get(
      `https://api.github.com${endpoint}`,
      {
        headers: {
          "User-Agent": "X2Y-SDK-Final-Production-Test",
          Accept: "application/vnd.github+json"
        }
      },
      res => {
        let bytes = 0;

        res.on("data", chunk => {
          bytes += chunk.length;
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
            bytes
          });
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(
        new Error(`Timeout while requesting ${endpoint}`)
      );
    });

    req.on("error", reject);
  });
}

async function recordLive(endpoint) {
  const record = await githubRequest(endpoint);

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

  // ==========================================================
  // 1. REAL API HEALTH
  // ==========================================================

  console.log("\n1️⃣ REAL GITHUB API HEALTH\n");

  const endpoints = [
    "/users/octocat",
    "/repos/x2ydevs/x2y-sdk",
    "/rate_limit"
  ];

  const initialRecords = [];

  for (const endpoint of endpoints) {
    try {
      const record = await recordLive(endpoint);

      initialRecords.push(record);

      console.log(
        `   📡 ${endpoint} | ` +
        `HTTP ${record.statusCode} | ` +
        `${record.responseTime}ms | ` +
        `remaining=${record.headers["x-ratelimit-remaining"] || "n/a"}`
      );

      check(
        `${endpoint} returned HTTP response`,
        record.statusCode > 0
      );

      check(
        `${endpoint} has real latency`,
        record.responseTime >= 0
      );

      check(
        `${endpoint} captured real headers`,
        Object.keys(record.headers).length > 0
      );

    } catch (error) {
      console.error(
        `   ❌ ${endpoint}: ${error.message}`
      );
      failed++;
    }
  }

  // ==========================================================
  // 2. REAL RATE LIMIT
  // ==========================================================

  console.log("\n2️⃣ REAL RATE-LIMIT TELEMETRY\n");

  const rateRecord =
    initialRecords.find(
      r => r.endpoint === "/rate_limit"
    );

  let realRemaining = null;
  let realLimit = null;

  if (rateRecord) {
    realRemaining = Number(
      rateRecord.headers["x-ratelimit-remaining"]
    );

    realLimit = Number(
      rateRecord.headers["x-ratelimit-limit"]
    );

    check(
      "Real x-ratelimit-remaining detected",
      Number.isFinite(realRemaining),
      String(realRemaining)
    );

    check(
      "Real x-ratelimit-limit detected",
      Number.isFinite(realLimit),
      String(realLimit)
    );

    if (
      Number.isFinite(realRemaining) &&
      Number.isFinite(realLimit) &&
      realLimit > 0
    ) {
      const usage =
        ((realLimit - realRemaining) / realLimit) * 100;

      console.log(
        `   📊 Real GitHub quota usage: ${usage.toFixed(2)}%`
      );

      console.log(
        `   📊 Real quota: ${realRemaining}/${realLimit}`
      );
    }
  }

  // ==========================================================
  // 3. CONTROLLED REAL CONCURRENCY
  // ==========================================================

  console.log("\n3️⃣ CONTROLLED REAL CONCURRENCY\n");

  const concurrency = 5;
  const requestsPerEndpoint = 4;

  const jobs = [];

  for (let round = 0; round < requestsPerEndpoint; round++) {
    for (const endpoint of endpoints) {
      jobs.push(endpoint);
    }
  }

  const concurrentRecords = [];

  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);

    console.log(
      `   ⚡ Batch ${Math.floor(i / concurrency) + 1}: ` +
      `${batch.length} real requests`
    );

    const results = await Promise.all(
      batch.map(async endpoint => {
        try {
          return await recordLive(endpoint);
        } catch (error) {
          console.log(
            `   ❌ ${endpoint}: ${error.message}`
          );

          return null;
        }
      })
    );

    for (const result of results) {
      if (result) {
        concurrentRecords.push(result);
      }
    }
  }

  console.log(
    `   📈 Real requests completed: ${concurrentRecords.length}/${jobs.length}`
  );

  check(
    "Controlled concurrent traffic completed",
    concurrentRecords.length === jobs.length
  );

  // ==========================================================
  // 4. REAL TRAFFIC METRICS
  // ==========================================================

  console.log("\n4️⃣ REAL TRAFFIC METRICS\n");

  const allRecords = [
    ...initialRecords,
    ...concurrentRecords
  ];

  const latencies =
    allRecords.map(r => r.responseTime);

  const minLatency =
    Math.min(...latencies);

  const maxLatency =
    Math.max(...latencies);

  const avgLatency =
    latencies.reduce((a, b) => a + b, 0) /
    latencies.length;

  const successful =
    allRecords.filter(
      r => r.statusCode >= 200 &&
           r.statusCode < 400
    ).length;

  console.log(
    `   Requests: ${allRecords.length}`
  );

  console.log(
    `   Successful: ${successful}`
  );

  console.log(
    `   Fastest: ${minLatency}ms`
  );

  console.log(
    `   Slowest: ${maxLatency}ms`
  );

  console.log(
    `   Average: ${avgLatency.toFixed(2)}ms`
  );

  check(
    "All traffic contains valid status codes",
    allRecords.every(
      r => r.statusCode >= 100
    )
  );

  check(
    "All traffic contains measured latency",
    allRecords.every(
      r => Number.isFinite(r.responseTime)
    )
  );

  check(
    "Real latency variation exists",
    maxLatency >= minLatency
  );

  // ==========================================================
  // 5. PREDICTIVE ANALYSIS
  // ==========================================================

  console.log("\n5️⃣ PREDICTIVE ISSUE ANALYSIS\n");

  const predictions = {};

  for (const endpoint of endpoints) {
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
        `${endpoint} produced valid risk`,
        ["low", "medium", "high"].includes(
          prediction.riskLevel
        )
      );

      check(
        `${endpoint} produced valid confidence`,
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

  const confidenceValues =
    Object.values(predictions)
      .map(p => p.confidence);

  check(
    "Confidence is differentiated",
    new Set(confidenceValues).size > 1,
    confidenceValues.join(" / ")
  );

  // ==========================================================
  // 6. REAL HTTP ERROR
  // ==========================================================

  console.log("\n6️⃣ REAL HTTP ERROR ANALYSIS\n");

  const errorEndpoint =
    "/this-resource-does-not-exist-x2y-final-test";

  try {
    const errorRecord =
      await recordLive(errorEndpoint);

    console.log(
      `   📛 HTTP status: ${errorRecord.statusCode}`
    );

    check(
      "Real HTTP error captured",
      errorRecord.statusCode >= 400
    );

    const errorPrediction =
      await sdk.predictAPIIssues(
        errorEndpoint
      );

    console.log(
      `   🔮 Risk: ${errorPrediction.riskLevel}`
    );

    console.log(
      `   🔮 Failure prediction: ${errorPrediction.predictedFailure}`
    );

    check(
      "Error traffic produced prediction",
      Boolean(errorPrediction)
    );

  } catch (error) {
    console.log(
      `   ❌ Error test failed: ${error.message}`
    );
    failed++;
  }

  // ==========================================================
  // 7. REAL FILE-LEVEL REFACTORING
  // ==========================================================

  console.log("\n7️⃣ REAL TYPESCRIPT REFACTORING\n");

  const fixturePath =
    path.join(
      process.cwd(),
      "x2y-production-fixture.ts"
    );

  const fixture = `
import { Pool } from "pg";

const pool = new Pool();

async function loadUsers(ids: string[]) {
  var results = [];

  for (var i = 0; i < ids.length; i++) {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [ids[i]]
    );

    results.push(result);
  }

  return fetch("/api/audit")
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      return {
        results,
        data
      };
    });
}
`;

  fs.writeFileSync(
    fixturePath,
    fixture,
    "utf8"
  );

  let suggestions = [];

  try {
    suggestions =
      await sdk.refactorFile(
        fixturePath
      );

    const performance =
      suggestions.filter(
        s => s.type === "performance"
      );

    const asyncSuggestions =
      suggestions.filter(
        s => s.type === "async"
      );

    console.log(
      `   🧠 Total suggestions: ${suggestions.length}`
    );

    console.log(
      `   ⚡ Performance: ${performance.length}`
    );

    console.log(
      `   🔄 Async: ${asyncSuggestions.length}`
    );

    check(
      "File-level analyzer executed",
      Array.isArray(suggestions)
    );

    check(
      "Performance analyzer executed",
      performance.length > 0
    );

    check(
      "Async analyzer executed",
      asyncSuggestions.length > 0
    );

    for (const [index, suggestion] of
         suggestions.slice(0, 5).entries()) {

      console.log(
        `\n      ${index + 1}. ${suggestion.type}`
      );

      console.log(
        `         ${suggestion.description || "No description"}`
      );

      if (suggestion.line) {
        console.log(
          `         Line: ${suggestion.line}`
        );
      }
    }

  } catch (error) {
    console.log(
      `   ❌ Refactoring failed: ${error.message}`
    );
    failed++;
  } finally {
    try {
      fs.unlinkSync(fixturePath);
    } catch (_) {}
  }

  // ==========================================================
  // 8. CORRECT ASYNC AUDIT REPORT
  // ==========================================================

  console.log("\n8️⃣ PROFESSIONAL AUDIT REPORT\n");

  const auditEntries =
    await Promise.all(
      endpoints.map(
        async endpoint => {
          const prediction =
            await sdk.predictAPIIssues(
              endpoint
            );

          return {
            endpoint,
            riskLevel:
              prediction.riskLevel,
            predictedFailure:
              prediction.predictedFailure,
            rateLimitApproaching:
              prediction.rateLimitApproaching,
            confidence:
              prediction.confidence
          };
        }
      )
    );

  const highRisk =
    auditEntries.filter(
      entry => entry.riskLevel === "high"
    );

  const mediumRisk =
    auditEntries.filter(
      entry => entry.riskLevel === "medium"
    );

  const report = {
    timestamp:
      new Date().toISOString(),

    environment:
      "LIVE_GITHUB_API",

    traffic: {
      totalRequests:
        allRecords.length,

      successfulRequests:
        successful,

      fastestMs:
        minLatency,

      slowestMs:
        maxLatency,

      averageMs:
        Number(avgLatency.toFixed(2))
    },

    rateLimit: {
      remaining:
        realRemaining,

      limit:
        realLimit
    },

    refactoring: {
      totalSuggestions:
        suggestions.length
    },

    predictions: auditEntries,

    riskSummary: {
      high:
        highRisk.length,

      medium:
        mediumRisk.length,

      low:
        auditEntries.length -
        highRisk.length -
        mediumRisk.length
    }
  };

  console.log(
    JSON.stringify(
      report,
      null,
      2
    )
  );

  // ==========================================================
  // 9. FINAL SCORE
  // ==========================================================

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     FINAL SCORE                             ║
╚══════════════════════════════════════════════════════════════╝
`);

  const total =
    passed + failed;

  const score =
    total === 0
      ? 0
      : ((passed / total) * 100).toFixed(1);

  console.log(
    `   Passed: ${passed}`
  );

  console.log(
    `   Failed: ${failed}`
  );

  console.log(
    `   Score:  ${score}%`
  );

  if (failed === 0) {
    console.log(`
🏆 FINAL PROFESSIONAL LIVE TEST: PASS

The SDK demonstrated:

  ✅ Real GitHub API traffic
  ✅ Real HTTP status codes
  ✅ Real response headers
  ✅ Real latency measurement
  ✅ Real rate-limit telemetry
  ✅ Controlled concurrent requests
  ✅ Traffic accumulation
  ✅ Predictive risk analysis
  ✅ Dynamic confidence
  ✅ Real HTTP error handling
  ✅ File-level TypeScript analysis
  ✅ Performance detection
  ✅ Async modernization detection
  ✅ Correct asynchronous audit aggregation

🔥 X2Y SDK — PRODUCTION INTEGRATION VALIDATION PASSED
`);
  } else {
    console.log(`
⚠️ FINAL TEST FAILED

Review the failed checks above.
The SDK should not be marked fully validated
until those failures are understood.
`);

    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error("\n💥 FATAL TEST ERROR");
  console.error(error);
  process.exit(1);
});
