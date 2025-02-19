const express = require("express")
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
    const sql = "SELECT * FROM Timesheet WHERE id = ?";
    db.get(sql, [timesheetId], (error, timesheet) => {
        if(error){
            next(error);
        }else if(timesheet){
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

timesheetsRouter.get("/", (req, res, next) => {
    const sql = "SELECT * FROM Timesheet WHERE employee_id = ?"
    db.all(sql, [req.params.employeeId], (error, timesheets) => {
        if(error){
            next(error);
        }else{
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetsRouter.post("/", (req, res, next) => {
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }

    const sql = "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES (?, ?, ?, ?)";
    const values = [hours, rate, date, employeeId];
    db.run(sql, values, function(error){
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Timesheet WHERE id = ?", [this.lastID], (error, newTimesheet) => {
                res.status(201).json({timesheet: newTimesheet});
            });
        }
    });
});

timesheetsRouter.put("/:timesheetId", (req, res, next) => {
    const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }

    const sql = "UPDATE Timesheet SET hours = ?, rate = ?, date = ?, employee_Id = ? WHERE id = ?";
    const values = [hours, rate, date, employeeId, req.params.timesheetId];
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }else{
            db.get("SELECT * FROM Timesheet WHERE id = ?", [req.params.timesheetId], (error, updateTimesheet) => {
                res.status(200).json({timesheet: updateTimesheet});
            });
        }
    });
});

timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
    const sql = "DELETE FROM Timesheet WHERE id = ?";
    db.run(sql, [req.params.timesheetId], (error) => {
        if(error){
            next(error);
        }else{
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;