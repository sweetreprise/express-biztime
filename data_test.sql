DROP DATABASE IF EXISTS biztime_test;
CREATE DATABASE biztime_test;

\c biztime_test;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);