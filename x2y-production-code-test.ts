import express = require("express");
import { Pool } from "pg";

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(express.json());

var requestCache: Record<string, any> = {};
var metrics: any[] = [];

async function loadDashboard(userId: string) {
  var user = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId]
  );

  var orders = await pool.query(
    "SELECT id, total, status FROM orders WHERE user_id = $1",
    [userId]
  );

  var notifications = await pool.query(
    "SELECT id, message, created_at FROM notifications WHERE user_id = $1",
    [userId]
  );

  return {
    user: user.rows[0],
    orders: orders.rows,
    notifications: notifications.rows
  };
}

async function enrichOrders(orders: any[]) {
  var results = [];

  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];

    var customer = await pool.query(
      "SELECT id, name FROM customers WHERE id = $1",
      [order.customer_id]
    );

    var shipping = await pool.query(
      "SELECT address, city FROM shipping_addresses WHERE order_id = $1",
      [order.id]
    );

    results.push({
      ...order,
      customer: customer.rows[0],
      shipping: shipping.rows[0],
      processedAt: new Date()
    });
  }

  return results;
}

function renderUsers(users: any[]) {
  var output = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    var element = document.querySelector(
      ".user-" + user.id
    );

    if (element) {
      element.textContent = user.name;
    }

    var status = document.querySelector("#status");

    if (status) {
      status.textContent = "Loaded " + user.name;
    }

    output.push({
      id: user.id,
      created: new Date(),
      data: new Array(1000).fill(user.id)
    });
  }

  return output;
}

async function fetchExternalData(userId: string) {
  return fetch(`/api/users/${userId}`)
    .then(function(res) {
      if (!res.ok) {
        throw new Error("User request failed");
      }

      return res.json();
    })
    .then(function(user) {
      return fetch(`/api/orders/${user.id}`)
        .then(function(res) {
          if (!res.ok) {
            throw new Error("Orders request failed");
          }

          return res.json();
        })
        .then(function(orders) {
          return fetch(`/api/notifications/${userId}`)
            .then(function(res) {
              if (!res.ok) {
                throw new Error("Notifications request failed");
              }

              return res.json();
            })
            .then(function(notifications) {
              return {
                user: user,
                orders: orders,
                notifications: notifications
              };
            });
        });
    })
    .catch(function(error) {
      console.error("External API failure:", error);
      throw error;
    });
}

async function processUserBatch(users: any[]) {
  var processed = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    try {
      var dashboard = await loadDashboard(user.id);

      var enriched = await enrichOrders(
        dashboard.orders
      );

      processed.push({
        user: dashboard.user,
        orders: enriched,
        notifications: dashboard.notifications
      });
    } catch (error) {
      console.error(
        "Failed processing user:",
        user.id,
        error
      );
    }
  }

  return processed;
}

app.get("/api/dashboard/:userId", async (req, res) => {
  try {
    var userId = req.params.userId;

    var dashboard = await loadDashboard(userId);

    res.json(dashboard);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load dashboard"
    });
  }
});

app.post("/api/process", async (req, res) => {
  try {
    var users = req.body.users || [];

    var result = await processUserBatch(users);

    res.json({
      count: result.length,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: "Processing failed"
    });
  }
});

app.get("/api/external/:userId", async (req, res) => {
  try {
    var result = await fetchExternalData(
      req.params.userId
    );

    res.json(result);
  } catch (error) {
    res.status(502).json({
      error: "External service unavailable"
    });
  }
});

async function healthCheck() {
  var db = await pool.query("SELECT 1");

  var external = await fetch(
    "https://api.example.com/health"
  );

  return {
    database: db.rows.length > 0,
    external: external.ok,
    timestamp: new Date()
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
