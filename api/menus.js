const express = require("express");
const menusRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

const menuItemsRouter = require("./menuItems");

menusRouter.param("menuId", (req, res, next, menuId) => {
    const sql = "SELECT * FROM Menu WHERE id = ?";
    db.get(sql, [menuId], (error, menu) => {
        if(error){
            next(error);
        }else if(menu){
            req.menu = menu;
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.post("/", (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }

    const sql = "INSERT INTO Menu (title) VALUES (?)";
    const values = [title];
    db.run(sql, values, function(error) {
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Menu WHERE id = ?", [this.lastID], (error, newMenu) => {
                res.status(201).json({menu: newMenu});
            });
        }
    });
});

menusRouter.put("/:menuId", (req, res, next) => {
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }

    const sql = "UPDATE Menu SET title = ? WHERE id = ?";
    const values = [title, req.params.menuId];
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Menu WHERE id = ?", [req.params.menuId], (error, updateMenu) => {
                res.status(200).json({menu: updateMenu});
            });
        }
    });
});

menusRouter.delete("/:menuId", (req, res, next) => {
    const sql = "SELECT * FROM MenuItem WHERE menu_id = ?";
    db.get(sql, [req.params.menuId], (error, menuItem) => {
        if(error){
            next(error);
        }else if(menuItem){
            return res.sendStatus(400)
        }else{
            const deleteSql = "DELETE FROM Menu WHERE id = ?";
            db.run(deleteSql, [req.params.menuId], (error) => {
                if(error){
                    next(error);
                }else{
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;