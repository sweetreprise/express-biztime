// Routes for invoices

const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// Returns info on invoices
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch(err) {
        return next(err);
    }
});

// Returns obj on given invoice
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(!results.rowCount) {
            throw new ExpressError('Item not found.', 404);
        }
        return res.json({ invoice: results.rows });
    } catch(err) {
        return next(err);
    }
});

// Adds an invoice
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0] });
    } catch(err) {
        return next(err);
    }
});

// Updates an invoice
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paidDate;

        if(isNaN(id)) {
            throw new ExpressError('ID must be a number', 404);
        }

        const invoice = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);

        if(!invoice.rowCount) {
            throw new ExpressError('Item not found.', 404);
        }

        const currPaidDate = invoice.rows[0].paid_date;

        if(!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }

        const results = await db.query(`UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 RETURNING *`, [id, amt, paid, paidDate]);

        return res.send({ invoice: results.rows[0] });
    } catch(err) {
        return next(err);
    }
});

// Deletes an invoice
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(!results.rows[0]) {
            throw new ExpressError('Invoice not found.', 404);
        }
        await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING *`, [id]);
        return res.json({ status: "deleted" });
    } catch(err) {
        return next(err);
    }
});

module.exports = router;