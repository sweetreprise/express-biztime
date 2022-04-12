const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// List all industries
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
        SELECT i.industry, c.code
        FROM industries AS i
        LEFT JOIN
        industries_companies AS ic
        ON i.code = ic.industry_code
        LEFT JOIN
        companies AS c
        ON ic.company_code = c.code
        `)

        const obj = {}
        results.rows.forEach(i => {

            if(!obj[i.industry]) {
                obj[i.industry] = [i.code]
            } else {
                obj[i.industry].push(i.code)
            }
        });
        return res.json({industries: [obj]})
    } catch(e) {
        return next(e);
    }
});

// Add an industry
router.post('/', async (req, res, next) => {
    try {
        const { code, industry, description } = req.body;
        const results = await db.query(`INSERT INTO industries (code, industry, description) VALUES ($1, $2, $3) RETURNING *`, [code, industry, description]);

        return res.status(201).json({ industry: results.rows[0] });
    } catch(e) {
        return next(e);
    }
});

// Associate an industry to a company
router.post('/associate', async (req, res, next) => {
    try {
        const { industry_code, company_code } = req.body;
        const i = await db.query(`SELECT * FROM industries WHERE code=$1`, [industry_code]);
        if(!i.rowCount) {
            throw new ExpressError(`${industry_code} not found`, 404);
        }

        const c = await db.query(`SELECT * FROM companies WHERE code=$1`, [company_code]);
        if(!c.rowCount) {
            throw new ExpressError(`${company_code} not found`, 404);
        }

        const results = await db.query(`INSERT INTO industries_companies (industry_code, company_code) VALUES ($1, $2) RETURNING *`, [industry_code, company_code]);

        return res.status(201).json({ association: results.rows[0] });
    } catch(e) {
        return next(e);
    }
})

module.exports = router;