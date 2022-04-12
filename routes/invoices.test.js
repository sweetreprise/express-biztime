process.env.NODE_ENV = 'test';
const request = require('supertest');
const app  = require('../app');
const db = require('../db');

let testInvoice;
let testUser;

beforeEach(async () => {
    const user = await db.query(`INSERT INTO companies (code, name, description) VALUES ('spotify', 'Spotify', 'Web Player: Music for Everyone') RETURNING *`);
    const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('spotify', '1000') RETURNING *`);
    testUser = user.rows[0]
    testInvoice = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Get list of invoices", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify({ invoices: [testInvoice] }));
    });
});

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify({ invoice: [testInvoice] }));
    });
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/companies/test`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /invoices", () => {
    test("Creates a invoice", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: `${testUser.code}`, amt: 500});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "spotify",
                amt: 500,
                paid: false,
                add_date: expect.anything(),
                paid_date: null
            }
        });
    });
});

describe("PUT /invoices/:id", () => {

    test("Updates an invoice", async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({ amt: 1000, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: "spotify",
                amt: 1000,
                paid: true,
                add_date: expect.anything(),
                paid_date: expect.anything()
            }
        });
    });
    test("Responds with 404 if attempting to update invalid invoice", async () => {
        const res = await request(app).put(`/invoices/test`).send({ amt: 500, paid: true })
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /invoices/:id", () => {
    test("Deletes an invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });
    test("Responds with 404 if attempting to update invalid code", async () => {
        const res = await request(app).delete(`/invoices/9999`);
        expect(res.statusCode).toBe(404);
    });
});
