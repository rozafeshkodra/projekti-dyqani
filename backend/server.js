const express = require("express");

const cron = require("node-cron");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const app = express();

app.use(express.json());

app.post("/test", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.get("/products", async (req, res) => {
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

app.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;

    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while inserting category!",
    });
  }
});

app.get("/categories", async (req, res) => {
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

app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
      },
    });

    res.json(category);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while updating category!",
    });
  }
});

app.delete("/categories/:id", async (req, res) => {
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
});

app.post("/suppliers", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name: name,
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
});

app.get("/suppliers", async (req, res) => {
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

app.put("/suppliers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const supplier = await prisma.supplier.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
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
});

app.delete("/suppliers/:id", async (req, res) => {
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
});

app.post("/products", async (req, res) => {
  try {
    const { name, categoryId, supplierId } = req.body;

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
});

app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, supplierId } = req.body;

    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
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
});

app.delete("/products/:id", async (req, res) => {
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
});

app.post("/stock-batches", async (req, res) => {
  try {
    const { productId, quantity, expiryDate } = req.body;

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
});

app.get("/stock-batches", async (req, res) => {
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

app.put("/stock-batches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, expiryDate } = req.body;

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
});

app.delete("/stock-batches/:id", async (req, res) => {
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
});

app.post("/expiry-alerts", async (req, res) => {
  try {
    const { stockBatchId, message } = req.body;

    const alert = await prisma.expiryAlert.create({
      data: {
        stockBatchId: Number(stockBatchId),
        message: message,
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error while inserting expiry alert!",
    });
  }
});

app.get("/expiry-alerts", async (req, res) => {
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

app.put("/expiry-alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    const alert = await prisma.expiryAlert.update({
      where: {
        id: Number(id),
      },
      data: {
        message: message,
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

app.delete("/expiry-alerts/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
});

const PORT = 5000;

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

app.get("/check-expiry", async (req, res) => {
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
});

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

app.listen(PORT, () => {
  console.log("Server is working on port " + PORT);
});
