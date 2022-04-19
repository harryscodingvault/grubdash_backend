const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Handlers Utils

function bodyHasProperty(propertyName) {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[propertyName] && data[propertyName] !== "") {
      if (propertyName === "dishes") {
        if (
          !Array.isArray(data[propertyName]) ||
          data[propertyName].length === 0
        ) {
          next({
            status: 400,
            message: `Order must include at least one dish`,
          });
        }
        data[propertyName].map((dish) => {
          if (!Number.isInteger(dish["quantity"]) || dish["quantity"] <= 0) {
            next({
              status: 400,
              message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
            });
          }
        });
      }

      return next();
    }
    next({
      status: 400,
      message:
        propertyName === "dishes"
          ? "Order must include a dish"
          : `Order must include a ${propertyName}`,
    });
  };
}

function hasIdParam(req, res, next) {
  const { orderId } = req.params;
  const foundItem = orders.find((item) => item.id === orderId);

  if (foundItem) {
    res.locals.order = foundItem;
    return next();
  }
  next({
    status: 404,
    message: `Order id is not found: ${orderId}`,
  });
}

// Routes Handlers
function list(req, res) {
  res.json({ data: orders });
}

function createOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    quantity: quantity,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

const getOrderById = (req, res, next) => {
  res.json({ data: res.locals.order });
};

function updateOrderById(req, res, next) {
  const { orderId } = req.params;
  const order = res.locals.order;
  const {
    data: { id, deliverTo, mobileNumber, dishes, quantity, status } = {},
  } = req.body;
  if (!status || status == "" || !["pending", "delivered"].includes(status)) {
    next({
      status: 400,
      message: `status invalid`,
    });
  }
  if (id === orderId || id === "" || id === undefined || id === null) {
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.quantity = quantity;
    res.status(200).json({ data: order });
  }

  next({
    status: 400,
    message: `Order id: ${(order, id)} does  not math param id: ${orderId}`,
  });
}

function deleteOrderById(req, res, next) {
  if (res.locals.order.status !== "pending") {
    next({
      status: 400,
      message: `Order status still pending`,
    });
  }
  const { orderId } = req.params;
  const index = orders.findIndex((item) => item.id === Number(orderId));
  const deletedOrder = orders.splice(index, 1);
  res.status(204).json({ data: "deleted" });
}

module.exports = {
  list,
  createOrder: [
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    createOrder,
  ],
  getOrderById: [hasIdParam, getOrderById],
  updateOrderById: [
    hasIdParam,
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    updateOrderById,
  ],
  deleteOrderById: [hasIdParam, deleteOrderById],
};
