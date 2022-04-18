const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass

router
  .route("/:dishId")
  .get(controller.getDishById)
  .put(controller.updateDishById)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.createDish)
  .all(methodNotAllowed);

module.exports = router;
