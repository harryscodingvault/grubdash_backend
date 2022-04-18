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

module.exports = {
  list,
  createOrder: [
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    createOrder,
  ],
};
