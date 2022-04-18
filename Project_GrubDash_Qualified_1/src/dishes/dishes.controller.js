const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Functions utils

const bodyHasProperty = (propertyName) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[propertyName] && data[propertyName] !== "") {
      if (propertyName === "price") {
        if (!Number.isInteger(data[propertyName]) || data[propertyName] <= 0) {
          next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`,
          });
        }
      }
      return next();
    }
    next({
      status: 400,
      message: `Dish must include a ${propertyName}`,
    });
  };
};

const hasIdParam = (req, res, next) => {
  const { dishId } = req.params;
  const foundItem = dishes.find((item) => item.id === dishId);

  if (foundItem) {
    res.locals.dish = foundItem;

    return next();
  }
  next({
    status: 400,
    message: `Dish id is not found: ${dishId}`,
  });
};

// Functions routes

const list = (req, res) => {
  res.json({ data: dishes });
};

const createDish = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const getDishById = (req, res, next) => {
  res.status(201).json({ data: res.locals.dish });
};

const updateDishById = (req, res, next) => {
  const dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.status(201).json({ data: dish });
};

module.exports = {
  list,
  createDish: [
    bodyHasProperty("name"),
    bodyHasProperty("description"),
    bodyHasProperty("price"),
    bodyHasProperty("image_url"),
    createDish,
  ],
  getDishById: [hasIdParam, getDishById],
  updateDishById: [
    hasIdParam,
    bodyHasProperty("name"),
    bodyHasProperty("description"),
    bodyHasProperty("price"),
    bodyHasProperty("image_url"),
    updateDishById,
  ],
};
