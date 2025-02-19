const express = require("express");
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
    const sql = "SELECT * FROM MenuItem WHERE id = ?";
    db.get(sql, [menuItemId], (error, menuItem) => {
        if(error){
            next(error);
        }else if(menuItem){
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get("/", (req, res, next) => {
    const sql = "SELECT * FROM MenuItem WHERE menu_id = ?";
    db.all(sql, [req.params.menuId], (error, menuItems) => {
        if(error){
            next(error);
        }else{
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post("/", (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;
    const sql = "SELECT * FROM Menu WHERE id = ?"
    db.get(sql, [menuId], (error, menu) => {
        if(error){
            next(error);
        }else{
            if(!name || !inventory || !price || !menu){
                return res.sendStatus(400);
            }
            
            const newSql = "INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES (?, ?, ?, ?, ?)";
            const values = [name, description, inventory, price, menuId];
            db.run(newSql, values, function(error){
                if(error){
                    next(error)
                }else{
                    db.get("SELECT * FROM MenuItem WHERE id = ?", [this.lastID], (error, newMenuItem) => {
                        res.status(201).json({menuItem: newMenuItem});
                    });
                }
            });
        }
    });
});

menuItemsRouter.put("/:menuItemId", (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;
    const sql = "SELECT * FROM Menu WHERE id = ?";
    db.get(sql, [req.params.menuId], (error, menu) => {
        if(error){
            next(error);
        }else{
            if(!name || !inventory || !price || !menu){
                return res.sendStatus(400)
            }

            const updateSql = "UPDATE MenuItem SET name = ?, description = ?, inventory = ?, price = ?, menu_id = ? WHERE id = ?";
            const values = [name, description, inventory, price, menuId, req.params.menuItemId];
            db.run(updateSql, values, function(error) {
                if(error){
                    next(error);
                }else{
                    db.get("SELECT * FROM MenuItem WHERE id = ?", [req.params.menuItemId], (error, updateMenuItem) => {
                        res.status(200).json({menuItem: updateMenuItem});
                    })
                }
            });
        }
    });
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
    const sql = "DELETE FROM MenuItem WHERE id = ?";
    db.run(sql, [req.params.menuItemId], (error) => {
        if(error){
            next(error);
        }else{
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;