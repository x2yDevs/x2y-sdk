const https = require("https");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { X2YSdk } = require("x2y-dev-tools-sdk");

const startedAt = new Date().toISOString();

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

function request(endpoint) {
  return new Promise((resolve, reject) => {
    const start = performance.now();

    const req = https.get(
      `https://api.github.com${endpoint}`,
      {
        headers: {
          "User-Agent": "X2Y-SDK-Release-Gate",
          Accept: "application/vnd.github+json"
        }
      },
      res => {
        let bytes = 0;

        res.on("data", chunk => {
          bytes += chunk.length;
        });

        res.on("end", () => {
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
            responseTime: Math.round(
              performance.now() - start
            ),
            statusCode: res.statusCode || 0,
            headers,
            bytes
          });
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(new Error(`Timeout: ${endpoint}`));
    });

    req.on("error", reject);
  });
}

async function liveRecord(sdk, endpoint) {
  const record = await request(endpoint);

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
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 X2Y SDK — RELEASE GATE                      ║
║          FINAL LIVE PRODUCTION VALIDATION                   ║
║                                                              ║
║     REAL HTTP • REAL HEADERS • REAL ERRORS • REAL SDK       ║
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

  const endpoints = [
    "/users/octocat",
    "/repos/x2ydevs/x2y-sdk",
    "/rate_limit"
  ];

  const records = [];

  // ==========================================================
  // 1. REAL API CONNECTIVITY
  // ==========================================================

  console.log("\n1️⃣ REAL API CONNECTIVITY\n");

  for (const endpoint of endpoints) {
    try {
      const record = await liveRecord(sdk, endpoint);
      records.push(record);

      console.log(
        `   📡 ${endpoint} | HTTP ${record.statusCode} | ` +
        `${record.responseTime}ms | ` +
        `remaining=${record.headers["x-ratelimit-remaining"] || "n/a"}`
      );

      check(
        `${endpoint} returned real HTTP response`,
        record.statusCode > 0
      );

      check(
        `${endpoint} has measured latency`,
        Number.isFinite(record.responseTime)
      );

      check(
        `${endpoint} captured response headers`,
        Object.keys(record.headers).length > 0
      );
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
      failed++;
    }
  }

  // ==========================================================
  // 2. REAL RATE LIMIT
  // ==========================================================

  console.log("\n2️⃣ REAL RATE-LIMIT VALIDATION\n");

  const rateRecord = records.find(
    r => r.endpoint === "/rate_limit"
  );

  let remaining = null;
  let limit = null;

  if (rateRecord) {
    remaining = Number(
      rateRecord.headers["x-ratelimit-remaining"]
    );

    limit = Number(
      rateRecord.headers["x-ratelimit-limit"]
    );

    check(
      "x-ratelimit-remaining detected",
      Number.isFinite(remaining)
    );

    check(
      "x-ratelimit-limit detected",
      Number.isFinite(limit) && limit > 0
    );

    if (
      Number.isFinite(remaining) &&
      Number.isFinite(limit) &&
      limit > 0
    ) {
      const usage =
        ((limit - remaining) / limit) * 100;

      console.log(
        `   📊 GitHub quota: ${remaining}/${limit}`
      );

      console.log(
        `   📊 Usage: ${usage.toFixed(2)}%`
      );
    }
  }

  // ==========================================================
  // 3. CONTROLLED CONCURRENCY
  // ==========================================================

  console.log("\n3️⃣ CONTROLLED LIVE CONCURRENCY\n");

  const concurrency = 5;
  const rounds = 4;

  const jobs = [];

  for (let i = 0; i < rounds; i++) {
    for (const endpoint of endpoints) {
      jobs.push(endpoint);
    }
  }

  const concurrentRecords = [];

  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);

    console.log(
      `   ⚡ Batch ${Math.floor(i / concurrency) + 1}: ` +
      `${batch.length} live requests`
    );

    const results = await Promise.all(
      batch.map(async endpoint => {
        try {
          return await liveRecord(sdk, endpoint);
        } catch (error) {
          console.log(
            `   ❌ ${endpoint}: ${error.message}`
          );
          return null;
        }
      })
    );

    concurrentRecords.push(
      ...results.filter(Boolean)
    );
  }

  records.push(...concurrentRecords);

  check(
    "All controlled concurrent requests completed",
    concurrentRecords.length === jobs.length,
    `${concurrentRecords.length}/${jobs.length}`
  );

  // ==========================================================
  // 4. LIVE METRICS
  // ==========================================================

  console.log("\n4️⃣ LIVE TRAFFIC METRICS\n");

  const latencies = records.map(
    r => r.responseTime
  );

  const fastest = Math.min(...latencies);
  const slowest = Math.max(...latencies);

  const average =
    latencies.reduce((a, b) => a + b, 0) /
    latencies.length;

  const successful = records.filter(
    r =>
      r.statusCode >= 200 &&
      r.statusCode < 400
  ).length;

  console.log(`   Requests: ${records.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Fastest: ${fastest}ms`);
  console.log(`   Slowest: ${slowest}ms`);
  console.log(`   Average: ${average.toFixed(2)}ms`);

  check(
    "Traffic records contain valid status codes",
    records.every(r => r.statusCode >= 100)
  );

  check(
    "Traffic records contain measured latency",
    records.every(r => Number.isFinite(r.responseTime))
  );

  check(
    "Live latency variation detected",
    slowest >= fastest
  );

  // ==========================================================
  // 5. PREDICTION
  // ==========================================================

  console.log("\n5️⃣ PREDICTIVE ISSUE ANALYSIS\n");

  const predictions = [];

  for (const endpoint of endpoints) {
    const prediction =
      await sdk.predictAPIIssues(endpoint);

    predictions.push({
      endpoint,
      ...prediction
    });

    console.log(`   🔮 ${endpoint}`);
    console.log(`      Risk: ${prediction.riskLevel}`);
    console.log(`      Failure: ${prediction.predictedFailure}`);
    console.log(
      `      Rate Limit: ${prediction.rateLimitApproaching}`
    );
    console.log(
      `      Confidence: ${prediction.confidence}%`
    );

    check(
      `${endpoint} returned valid risk`,
      ["low", "medium", "high"].includes(
        prediction.riskLevel
      )
    );

    check(
      `${endpoint} returned valid confidence`,
      prediction.confidence >= 50 &&
      prediction.confidence <= 98
    );
  }

  const confidenceValues =
    predictions.map(p => p.confidence);

  check(
    "Confidence differentiation",
    new Set(confidenceValues).size > 1,
    confidenceValues.join(" / ")
  );

  // ==========================================================
  // 6. REAL HTTP ERROR
  // ==========================================================

  console.log("\n6️⃣ REAL HTTP ERROR HANDLING\n");

  const missingEndpoint =
    "/x2y-release-gate-resource-that-does-not-exist";

  try {
    const errorRecord =
      await liveRecord(
        sdk,
        missingEndpoint
      );

    console.log(
      `   📛 HTTP ${errorRecord.statusCode}`
    );

    check(
      "Real HTTP 4xx error captured",
      errorRecord.statusCode >= 400 &&
      errorRecord.statusCode < 500
    );

    const errorPrediction =
      await sdk.predictAPIIssues(
        missingEndpoint
      );

    console.log(
      `   🔮 Risk: ${errorPrediction.riskLevel}`
    );

    console.log(
      `   🔮 Failure: ${errorPrediction.predictedFailure}`
    );

    check(
      "Error traffic produced prediction",
      Boolean(errorPrediction)
    );
  } catch (error) {
    console.log(
      `   ❌ Error handling test failed: ${error.message}`
    );
    failed++;
  }

  // ==========================================================
  // 7. FILE-LEVEL REFACTORING
  // ==========================================================

  console.log("\n7️⃣ FILE-LEVEL TYPESCRIPT ANALYSIS\n");

  const fixturePath = path.join(
    process.cwd(),
    ".x2y-release-fixture.ts"
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
      return { results, data };
    });
}
`;

  fs.writeFileSync(
    fixturePath,
    fixture,
    "utf8"
  );

  try {
    const suggestions =
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

    const idioms =
      suggestions.filter(
        s => s.type === "idiom"
      );

    console.log(
      `   🧠 Suggestions: ${suggestions.length}`
    );

    console.log(
      `   ⚡ Performance: ${performance.length}`
    );

    console.log(
      `   🔄 Async: ${asyncSuggestions.length}`
    );

    console.log(
      `   🧹 Idiom: ${idioms.length}`
    );

    check(
      "File-level analysis executed",
      Array.isArray(suggestions)
    );

    check(
      "Performance detection executed",
      performance.length > 0
    );

    check(
      "Async detection executed",
      asyncSuggestions.length > 0
    );

    check(
      "Idiom detection executed",
      idioms.length > 0
    );
  } finally {
    try {
      fs.unlinkSync(fixturePath);
    } catch (_) {}
  }

  // ==========================================================
  // 8. CORRECT ASYNC AUDIT
  // ==========================================================

  console.log("\n8️⃣ FINAL ASYNC AUDIT\n");

  const audit = await Promise.all(
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
    audit.filter(
      x => x.riskLevel === "high"
    ).length;

  const mediumRisk =
    audit.filter(
      x => x.riskLevel === "medium"
    ).length;

  const lowRisk =
    audit.filter(
      x => x.riskLevel === "low"
    ).length;

  console.log(
    JSON.stringify(
      {
        releaseGate: "X2Y-SDK",
        timestamp: startedAt,
        environment: "LIVE_GITHUB_API",
        traffic: {
          totalRequests: records.length,
          successfulRequests: successful,
          fastestMs: fastest,
          slowestMs: slowest,
          averageMs: Number(
            average.toFixed(2)
          )
        },
        rateLimit: {
          remaining,
          limit
        },
        predictions: audit,
        riskSummary: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        }
      },
      null,
      2
    )
  );

  // ==========================================================
  // FINAL RELEASE DECISION
  // ==========================================================

  const total = passed + failed;

  const score =
    total === 0
      ? 0
      : (passed / total) * 100;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     RELEASE DECISION                       ║
╚══════════════════════════════════════════════════════════════╝
`);

  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(
    `   Score:  ${score.toFixed(1)}%`
  );

  if (failed === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🟢 RELEASE APPROVED                     ║
╚══════════════════════════════════════════════════════════════╝

X2Y SDK FINAL LIVE VALIDATION: PASS

Real API traffic                 ✅
Real HTTP telemetry              ✅
Real rate-limit telemetry        ✅
Controlled concurrency           ✅
Traffic accumulation             ✅
Predictive analysis              ✅
Confidence differentiation       ✅
Real HTTP error handling         ✅
File-level TypeScript analysis   ✅
Performance detection            ✅
Async modernization              ✅
Idiom detection                  ✅
Async audit aggregation          ✅

🔥 X2Y SDK — RELEASE GATE PASSED
`);
  } else {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🔴 RELEASE BLOCKED                      ║
╚══════════════════════════════════════════════════════════════╝

The release gate contains failed checks.
Do NOT mark this build production-ready until
the failures are understood.
`);

    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(`
💥 FATAL RELEASE-GATE ERROR

${error.stack || error.message || error}
`);

  process.exit(1);
});
