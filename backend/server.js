require("dotenv").config();

const express = require("express");

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const cron = require("node-cron");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const { JsonWebTokenError } = require("jsonwebtoken");

const prisma = new PrismaClient();

const app = express();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes!",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());

app.use(express.json({ limit: "10kb" }));

//Autentifikimi

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied! Token is required!",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token!",
      });
    }

    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: "You do not have permission to perform this action!",
      });
    }

    next();
  };
}

app.post("/test", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.get("/", (req, res) => {
  res.send("Server is working!");
});

//Register

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({
        message: "Valid email is required!",
      });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters!",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while resgistering user!",
    });
  }
});

//Login

app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({
        message: "Valid email is required!",
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        message: "Password is required!",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password!",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      message: "Login successful!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while logging in!",
    });
  }
});

//Categories

app.post(
  "/categories",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Category name is required!",
        });
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
        },
      });

      res.status(201).json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while inserting category!",
      });
    }
  },
);

app.get("/categories", authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany();

    res.json(categories);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while fetching category!",
    });
  }
});

app.put(
  "/categories/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          message: "Valid category ID is required!",
        });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Category name is required!",
        });
      }

      const category = await prisma.category.update({
        where: {
          id: Number(id),
        },
        data: {
          name: name.trim(),
        },
      });

      res.json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while updating category!",
      });
    }
  },
);

app.delete(
  "/categories/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.category.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Category is deleted!",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while deleting category!",
      });
    }
  },
);

//Suppliers

app.post(
  "/suppliers",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Supplier name is required!",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          message: "Valid email address is required!",
        });
      }

      const supplier = await prisma.supplier.create({
        data: {
          name: name.trim(),
          email: email,
          phone: phone,
        },
      });

      res.status(201).json(supplier);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while inserting supplier!",
      });
    }
  },
);

app.get("/suppliers", authenticateToken, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();

    res.json(suppliers);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while fetching supplier!",
    });
  }
});

app.put(
  "/suppliers/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          message: "Valid supplier ID is required!",
        });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Supplier name is required!",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          message: "Valid email address is required!",
        });
      }

      const supplier = await prisma.supplier.update({
        where: {
          id: Number(id),
        },
        data: {
          name: name.trim(),
          email: email,
          phone: phone,
        },
      });

      res.json(supplier);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while updating supplier!",
      });
    }
  },
);

app.delete(
  "/suppliers/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.supplier.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Supplier is deleted!",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while deleting supplier!",
      });
    }
  },
);

//Products

app.post(
  "/products",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { name, categoryId, supplierId } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Product name is required!",
        });
      }

      if (!categoryId || isNaN(Number(categoryId))) {
        return res.status(400).json({
          message: "Valid category ID is required!",
        });
      }

      if (!supplierId || isNaN(Number(supplierId))) {
        return res.status(400).json({
          message: "Valid supplier ID is required!",
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!category) {
        return res.status(400).json({
          message: "Category not found!",
        });
      }

      const supplier = await prisma.supplier.findUnique({
        where: { id: Number(supplierId) },
      });

      if (!supplier) {
        return res.status(400).json({
          message: "Supplier not found!",
        });
      }

      const product = await prisma.product.create({
        data: {
          name: name,
          categoryId: Number(categoryId),
          supplierId: Number(supplierId),
        },
      });

      res.status(201).json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while inserting product!",
      });
    }
  },
);

app.get("/products", authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        stockBatches: true,
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching products!",
    });
  }
});

app.put(
  "/products/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, categoryId, supplierId } = req.body;

      if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          message: "Valid product ID is required!",
        });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Product name is required!",
        });
      }

      if (!categoryId || isNaN(Number(categoryId)) || Number(categoryId) <= 0) {
        return res.status(400).json({
          message: "Valid category ID is required!",
        });
      }

      if (!supplierId || isNaN(Number(supplierId)) || Number(supplierId) <= 0) {
        return res.status(400).json({
          message: "Valid supplier ID is required!",
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!category) {
        return res.status(400).json({
          message: "Category not found!",
        });
      }

      const supplier = await prisma.supplier.findUnique({
        where: { id: Number(supplierId) },
      });

      if (!supplier) {
        return res.status(400).json({
          message: "Supplier not found!",
        });
      }

      const product = await prisma.product.update({
        where: {
          id: Number(id),
        },
        data: {
          name: name.trim(),
          categoryId: Number(categoryId),
          supplierId: Number(supplierId),
        },
      });

      res.json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while updating product!",
      });
    }
  },
);

app.delete(
  "/products/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.product.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Product is deleted!",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while deleting product!",
      });
    }
  },
);

//Stock Batches

app.post(
  "/stock-batches",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { productId, quantity, expiryDate } = req.body;

      if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({
          message: "Valid product ID is required!",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) {
        return res.status(400).json({
          message: "Product not found!",
        });
      }

      if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        return res.status(400).json({
          message: "Valid quantity is required!",
        });
      }

      if (!expiryDate || isNaN(Date.parse(expiryDate))) {
        return res.status(400).json({
          message: "Valid expiry date is required!",
        });
      }

      const stockBatch = await prisma.stockBatch.create({
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
          expiryDate: new Date(expiryDate),
        },
      });

      res.status(201).json(stockBatch);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while inserting stock batch!",
      });
    }
  },
);

app.get("/stock-batches", authenticateToken, async (req, res) => {
  try {
    const stockBatches = await prisma.stockBatch.findMany({
      include: {
        product: true,
        alerts: true,
      },
    });

    res.json(stockBatches);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while fetching stock batch!",
    });
  }
});

app.put(
  "/stock-batches/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { productId, quantity, expiryDate } = req.body;

      if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          message: "Valid stock batch ID is required!",
        });
      }

      if (!productId || isNaN(Number(productId)) || Number(productId) <= 0) {
        return res.status(400).json({
          message: "Valid product ID is required!",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) {
        return res.status(400).json({
          message: "Product not found!",
        });
      }

      if (
        quantity === undefined ||
        quantity === null ||
        quantity === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message: "Valid quantity is required!",
        });
      }

      if (!expiryDate || isNaN(Date.parse(expiryDate))) {
        return res.status(400).json({
          message: "Valid expiry date is required!",
        });
      }

      const stockBatch = await prisma.stockBatch.update({
        where: {
          id: Number(id),
        },
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
          expiryDate: new Date(expiryDate),
        },
      });

      res.json(stockBatch);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while updating stock batch!",
      });
    }
  },
);

app.delete(
  "/stock-batches/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.stockBatch.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Stock batch is deleted!",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while deleting stock batch!",
      });
    }
  },
);

//Expiry Alerts

app.post(
  "/expiry-alerts",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { stockBatchId, message } = req.body;

      if (
        !stockBatchId ||
        isNaN(Number(stockBatchId)) ||
        Number(stockBatchId) <= 0
      ) {
        return res.status(400).json({
          message: "Valid stock batch ID is required!",
        });
      }

      const stockBatch = await prisma.stockBatch.findUnique({
        where: { id: Number(stockBatchId) },
      });

      if (!stockBatch) {
        return res.status(400).json({
          message: "Stock batch not found!",
        });
      }

      if (!message || message.trim() === "") {
        return res.status(400).json({
          message: "Alert message is required!",
        });
      }

      const alert = await prisma.expiryAlert.create({
        data: {
          stockBatchId: Number(stockBatchId),
          message: message.trim(),
        },
      });

      res.status(201).json(alert);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while inserting expiry alert!",
      });
    }
  },
);

app.get("/expiry-alerts", authenticateToken, async (req, res) => {
  try {
    const alerts = await prisma.expiryAlert.findMany({
      include: {
        stockBatch: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(alerts);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while fetching expiry alert!",
    });
  }
});

app.put("/expiry-alerts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isNaN(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Valid alert ID is required!",
      });
    }

    if (!status || !["UNREAD", "READ"].includes(status)) {
      return res.status(400).json({
        message: "Valid alert status is required!",
      });
    }

    const alert = await prisma.expiryAlert.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status,
      },
    });

    res.json(alert);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while updating expiry alert!",
    });
  }
});

app.delete(
  "/expiry-alerts/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          message: "Valid alert ID is required!",
        });
      }

      await prisma.expiryAlert.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Expiry alert is deleted!",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while deleting expiry alert!",
      });
    }
  },
);

const PORT = process.env.PORT || 5000;

async function checkExpiryDates() {
  const today = new Date();

  const nextSevenDays = new Date();
  nextSevenDays.setDate(today.getDate() + 7);

  const stockBatches = await prisma.stockBatch.findMany({
    where: {
      expiryDate: {
        gte: today,
        lte: nextSevenDays,
      },
    },
    include: {
      product: true,
    },
  });

  const alerts = [];

  for (const batch of stockBatches) {
    const existingAlert = await prisma.expiryAlert.findFirst({
      where: {
        stockBatchId: batch.id,
      },
    });

    if (!existingAlert) {
      const alert = await prisma.expiryAlert.create({
        data: {
          stockBatchId: batch.id,
          message:
            batch.product.name +
            " expires on " +
            batch.expiryDate.toLocaleDateString("en-GB") +
            ". Please check the stock.",
        },
      });

      alerts.push(alert);
    }
  }

  return alerts;
}

app.post(
  "/check-expiry",
  authenticateToken,
  authorizeRole("ADMIN"),
  async (req, res) => {
    try {
      const alerts = await checkExpiryDates();

      res.json({
        message: "Expiry date check completed!",
        alerts: alerts,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error while checking expiry dates!",
      });
    }
  },
);

cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      console.log("Automatic expiry check started!");

      const alerts = await checkExpiryDates();

      console.log("Automatic expiry check completed!");
      console.log("New alerts created: " + alerts.length);
    } catch (error) {
      console.log("Error during automatic expiry check:", error);
    }
  },
  {
    timezone: "Europe/Belgrade",
  },
);

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found!",
  });
});

app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).json({
    message: "Internal server error!",
  });
});

app.listen(PORT, () => {
  console.log("Server is working on port " + PORT);
});
