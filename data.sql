DROP DATABASE IF EXISTS biztime;
CREATE DATABASE biztime;

\c biztime;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industries_companies (
  industry_code TEXT NOT NULL REFERENCES industries,
  company_code TEXT NOT NULL REFERENCES companies,
  PRIMARY KEY(industry_code, company_code)
);


INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES  ('cryp', 'Cryptocurrency'),
          ('tech', 'Technology'),
          ('game', 'Gaming'),
          ('food', 'Food Services'),
          ('hosp', 'Hospitality & Tourism')


-- SELECT i.industry
-- FROM industries AS i
-- LEFT JOIN
-- industries_companies AS ic
-- on i.code = ic.industry_code
-- WHERE ic.company_code = 'apple'