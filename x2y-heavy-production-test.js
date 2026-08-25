const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const sdkPackage = require("x2y-dev-tools-sdk");
const X2YSdk = sdkPackage.X2YSdk || sdkPackage.default || sdkPackage;

const BASE_URL = "https://api.github.com";
const USER_AGENT = "x2y-dev-tools-sdk-heavy-test";

const TOTAL_REQUESTS = 100;
const CONCURRENCY = 10;

const results = [];
const failures = [];
const refactorResults = [];

function section(title) {
  console.log("\n" + "=".repeat(80));
  console.log(title);
  console.log("=".repeat(80));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(endpoint) {
  const start = performance.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github+json"
      }
    });

    const responseTime = Math.round(performance.now() - start);

    const headers = {};

    for (const [key, value] of response.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }

    const body = await response.text();

    return {
      endpoint,
      method: "GET",
      timestamp: Date.now(),
      responseTime,
      statusCode: response.status,
      headers,
      bodyLength: body.length
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - start);

    return {
      endpoint,
      method: "GET",
      timestamp: Date.now(),
      responseTime,
      statusCode: 0,
      headers: {},
      bodyLength: 0,
      error: error.message
    };
  }
}

async function runTrafficTest(sdk) {
  section("PHASE 1 — REAL HIGH-VOLUME HTTP TRAFFIC");

  const endpoints = [
    "/users/octocat",
    "/repos/x2ydevs/x2y-sdk",
    "/rate_limit"
  ];

  let completed = 0;

  async function worker(workerId) {
    while (true) {
      const index = completed++;

      if (index >= TOTAL_REQUESTS) {
        return;
      }

      const endpoint = endpoints[index % endpoints.length];

      const result = await request(endpoint);

      results.push(result);

      sdk.recordAPITraffic({
        endpoint: result.endpoint,
        method: result.method,
        timestamp: result.timestamp,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        headers: result.headers
      });

      if (result.error || result.statusCode >= 400) {
        failures.push(result);
      }

      if ((index + 1) % 10 === 0) {
        console.log(
          `[worker ${workerId}] completed ${index + 1}/${TOTAL_REQUESTS}`
        );
      }
    }
  }

  const workers = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i + 1));
  }

  await Promise.all(workers);

  console.log(`\nRequests attempted: ${TOTAL_REQUESTS}`);
  console.log(`Requests completed: ${results.length}`);
  console.log(`HTTP failures: ${failures.length}`);
}

async function runPredictionTest(sdk) {
  section("PHASE 2 — REAL PREDICTIVE ANALYSIS");

  const endpoints = [
    "/users/octocat",
    "/repos/x2ydevs/x2y-sdk",
    "/rate_limit"
  ];

  for (const endpoint of endpoints) {
    console.log(`\nAnalyzing ${endpoint}`);

    try {
      const prediction = await sdk.predictAPIIssues(endpoint);

      console.log(JSON.stringify(prediction, null, 2));
    } catch (error) {
      console.error(
        `Prediction failed for ${endpoint}: ${error.message}`
      );
      failures.push({
        phase: "prediction",
        endpoint,
        error: error.message
      });
    }
  }
}

async function runRefactoringTest(sdk) {
  section("PHASE 3 — REAL CODE REFACTORING ENGINE");

  const fixtures = {
    idiom: `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
`,

    async: `
function getUser() {
  return fetch("/api/user")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      console.error(error);
    });
}
`,

    performance: `
function renderUsers(users) {
  for (var i = 0; i < users.length; i++) {
    document.querySelector("#users").innerHTML +=
      "<div>" + users[i].name + "</div>";
  }
}
`,

    mixed: `
function loadUsers() {
  var users = [];

  return fetch("/api/users")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      for (var i = 0; i < data.length; i++) {
        document.querySelector("#users").innerHTML +=
          "<div>" + data[i].name + "</div>";
      }

      users = data;

      return users;
    });
}
`
  };

  for (const [name, source] of Object.entries(fixtures)) {
    console.log(`\nTesting fixture: ${name}`);

    try {
      const suggestions = await sdk.refactorCode(source);

      refactorResults.push({
        fixture: name,
        suggestions
      });

      console.log(
        JSON.stringify(suggestions, null, 2)
      );
    } catch (error) {
      console.error(
        `Refactoring failed for ${name}: ${error.message}`
      );

      failures.push({
        phase: "refactoring",
        fixture: name,
        error: error.message
      });
    }
  }
}

function calculateMetrics() {
  const successful = results.filter(
    r => r.statusCode >= 200 && r.statusCode < 400
  );

  const latencies = results
    .map(r => r.responseTime)
    .filter(Number.isFinite);

  const average =
    latencies.reduce((a, b) => a + b, 0) /
    Math.max(latencies.length, 1);

  const fastest = Math.min(...latencies);
  const slowest = Math.max(...latencies);

  const variance =
    latencies.reduce(
      (sum, value) => sum + Math.pow(value - average, 2),
      0
    ) / Math.max(latencies.length, 1);

  const standardDeviation = Math.sqrt(variance);

  const coefficientOfVariation =
    average === 0
      ? 0
      : standardDeviation / average;

  return {
    totalRequests: results.length,
    successfulRequests: successful.length,
    failedRequests: results.length - successful.length,
    fastestMs: fastest,
    slowestMs: slowest,
    averageMs: Number(average.toFixed(2)),
    standardDeviationMs: Number(
      standardDeviation.toFixed(2)
    ),
    coefficientOfVariation: Number(
      coefficientOfVariation.toFixed(4)
    )
  };
}

function printReleaseGate(metrics) {
  section("FINAL RELEASE GATE");

  console.log(
    JSON.stringify(
      {
        sdk: "x2y-dev-tools-sdk",
        environment: "LIVE_GITHUB_API",
        testMode: "REAL_HTTP",
        metrics,
        refactoringFixtures: refactorResults.length,
        failures: failures.length
      },
      null,
      2
    )
  );

  const checks = [
    {
      name: "Real HTTP traffic",
      passed: results.length > 0
    },
    {
      name: "SDK traffic recording",
      passed: results.length >= TOTAL_REQUESTS * 0.9
    },
    {
      name: "Latency telemetry",
      passed: results.some(r => r.responseTime > 0)
    },
    {
      name: "Real response headers",
      passed: results.some(
        r => Object.keys(r.headers).length > 0
      )
    },
    {
      name: "Predictive analysis",
      passed: failures.filter(
        f => f.phase === "prediction"
      ).length === 0
    },
    {
      name: "Refactoring engine",
      passed: refactorResults.length === 4
    }
  ];

  console.log("\nCAPABILITY CHECKS");

  for (const check of checks) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"} — ${check.name}`
    );
  }

  const passed =
    checks.every(check => check.passed) &&
    failures.length === 0;

  console.log("\n" + "-".repeat(80));

  if (passed) {
    console.log("RELEASE GATE: PASS");
  } else {
    console.log("RELEASE GATE: FAIL");
    console.log("\nFailures:");

    for (const failure of failures) {
      console.log(JSON.stringify(failure, null, 2));
    }

    process.exitCode = 1;
  }
}

async function main() {
  section("X2Y DEV TOOLS SDK — HEAVY PRODUCTION TEST");

  console.log("Node:", process.version);
  console.log("SDK package:", "x2y-dev-tools-sdk");
  console.log("HTTP target:", BASE_URL);
  console.log("Requests:", TOTAL_REQUESTS);
  console.log("Concurrency:", CONCURRENCY);
  console.log("Mode:", "REAL HTTP / REAL SDK / REAL HEADERS");

  const sdk = new X2YSdk(
    {
      rateLimitThreshold: 80,
      predictionWindow: 60000
    },
    {
      targetLanguage: "typescript",
      rules: [
        "performance",
        "idiom",
        "async"
      ]
    }
  );

  await runTrafficTest(sdk);

  await sleep(500);

  await runPredictionTest(sdk);

  await runRefactoringTest(sdk);

  const metrics = calculateMetrics();

  section("TRAFFIC METRICS");

  console.log(
    JSON.stringify(metrics, null, 2)
  );

  printReleaseGate(metrics);
}

main().catch(error => {
  console.error("\nFATAL TEST ERROR");
  console.error(error);
  process.exit(1);
});
