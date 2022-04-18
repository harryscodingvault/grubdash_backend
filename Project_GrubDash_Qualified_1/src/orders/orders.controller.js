const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Functions utils

const bodyHasProperty = (propertyName) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[propertyName] && data[propertyName] !== "") {
      if (propertyName === "dishes") {
        if (!Array.isArray(data[propertyName]) || data[propertyName] === []) {
          next({
            status: 400,
            message: `Order must include at least one dish`,
          });
        }
        data[propertyName].map((dish) => {
          if (!Number.isInteger(dish["quantity"]) || dish["quantity"] <= 0) {
            next({
              status: 400,
              message: `Dish ${data[propertyName]} must have a quantity that is an integer greater than 0`,
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
};

const hasIdParam = (req, res, next) => {
  const { orderId } = req.params;
  const foundItem = orders.find((item) => item.id === orderId);

  if (foundItem) {
    res.locals.order = foundItem;
    return next();
  }
  next({
    status: 400,
    message: `Order id is not found: ${orderId}`,
  });
};

// Functions routes
const list = (req, res) => {
  res.json({ data: orders });
};

const createOrder = (req, res, next) => {
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
};

const getOrderById = (req, res, next) => {
  res.json({ data: res.locals.order });
};

const updateOrderById = (req, res, next) => {
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, dishes, quantity } = {} } =
    req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.quantity = quantity;
  res.status(201).json({ data: order });
};

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
};
