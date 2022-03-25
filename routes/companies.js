// Routes for companies

const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// Get all companies
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({"companies": results.rows});
    } catch(err) {
        return next(err);
    }
});

// router.get('/:code', async (req, res, next) => {
//     try {
//         const { code } = req.query;
//         const results = await db.query(`SELECT * FROM companies WHERE code='$1'`, [code]);
//         return res.json(results.rows);
//     } catch(err) {
//         return next(err);
//     }
// });

// Get company based on company code
router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code]);
        if(!results.rowCount) {
            throw new ExpressError('Item not found.', 404);
        }
        if(!invoices.rowCount) {
            invoices.rows = "None"
        }
        return res.json({"company": results.rows, "invoices": [invoices.rows]});
    } catch(err) {
        return next(err);
    }
});

// Add a company into the companies table
router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        return res.status(201).json({"company": results.rows[0]});
    } catch(err) {
        return next(err);
    }
}); 

// Edits an existing company
router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING *`, [code, name, description]);
        if(!results.rowCount) {
            throw new ExpressError('Item not found.', 404);
        }
        return res.send({"company": results.rows[0]});
    } catch(err) {
        return next(err);
    }
});

// Deletes company
router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        return res.json({ status: "deleted" });
    } catch(err) {
        return next(err);
    }
});

module.exports = router;