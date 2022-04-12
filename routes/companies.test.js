process.env.NODE_ENV = 'test';
const request = require('supertest');
const app  = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('spotify', 'Spotify', 'Web Player: Music for everyone') RETURNING *`);
    testCompany = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get list of companies", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] });
    });
});

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: [testCompany], invoices: ["None"], industries: ["None"] });
    });
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/companies/test`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Creates a company", async () => {
        const res = await request(app).post('/companies').send({ code: "apple", name: "Apple", description: "Maker of Apple products."});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: {
                code: "apple",
                name: "Apple",
                description: "Maker of Apple products."
            }
        });
    });
});

describe("PUT /companies", () => {
    test("Updates a company", async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({ code: "spotify", name: "Spotify Inc.", description: "MAKE ALL OF THE PLAYLISTS."});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: "spotify",
                name: "Spotify Inc.",
                description: "MAKE ALL OF THE PLAYLISTS."
            }
        });
    });
    test("Responds with 404 if attempting to update invalid code", async () => {
        const res = await request(app).put(`/companies/test`).send({ code: "test", name: "Test", description: "TEST TEST TEST"})
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /companies", () => {
    test("Deletes a company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });
});

