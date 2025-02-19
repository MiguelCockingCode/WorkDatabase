const express = require("express");
const employeesRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

const timesheetsRouter = require('./timesheets.js');

employeesRouter.param("employeeId", (req, res, next, employeeId) => {
    const sql = "SELECT * FROM Employee WHERE id = ?";
    db.get(sql, [employeeId], (error, employee) => {
        if(error){
            next(error);
        }else if(employee){
            req.employee = employee;
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get("/", (req, res, next) => {
    const sql = "SELECT * FROM Employee WHERE is_current_employee = 1";
    db.all(sql, (error, employees) => {
        if(error){
            next(error);
        }else{
            res.status(200).json({employees: employees});
        }
    });
});

employeesRouter.get("/:employeeId", (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeesRouter.post("/", (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    const sql = "INSERT INTO Employee (name, position, wage, is_current_employee) VALUES (?, ?, ?, ?)";
    const values = [name, position, wage, isCurrentEmployee];

    db.run(sql, values, function(error){
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Employee WHERE id = ?", [this.lastID], (error, newEmployee) => {
                res.status(201).json({employee: newEmployee});
            });
        }
    });
});

employeesRouter.put("/:employeeId", (req, res, next) => {
    const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    const sql = "UPDATE Employee SET name = ?, position = ?, wage = ?, is_current_employee = ? WHERE id = ?";
    const values = [name, position, wage, isCurrentEmployee, req.params.employeeId];

    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Employee WHERE id = ?", [req.params.employeeId], (error, updateEmployee) => {
                if(error){
                    return next(error);
                }else{
                    res.status(200).json({employee: updateEmployee});
                }
            });
        }
    });
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
    const sql = "UPDATE Employee SET is_current_employee = 0 WHERE id = ?";
    db.run(sql, [req.params.employeeId], (error) => {
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Employee WHERE id = ?", [req.params.employeeId], (error, deleteEmployee) => {
                res.status(200).json({employee: deleteEmployee});
            });
        }
    });
});

module.exports = employeesRouter;