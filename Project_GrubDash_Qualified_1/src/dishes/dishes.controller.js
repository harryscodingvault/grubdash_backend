const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const list = (req, res) => {
  res.json({ data: dishes });
};

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

module.exports = {
  list,
  createDish: [
    bodyHasProperty("name"),
    bodyHasProperty("description"),
    bodyHasProperty("price"),
    bodyHasProperty("image_url"),
    createDish,
  ],
};
