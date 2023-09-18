const express = require('express');
const app = express();
const PORT = 8080;
const mysql = require("mysql2/promise");
const cors = require('cors');
const shortid = require('shortid');
const fetch = require('node-fetch');
const { parse } = require('node-html-parser');
app.use(express.json());
app.use(cors());
const QRCode = require('qrcode');
const fs = require('fs');

const pool = mysql.createPool({
    host: 'buuuikfhqw5l0acqlcy2-mysql.services.clever-cloud.com',
    user: 'uqjnic7dnnlbtjgq',
    password: 'jfD5NPBmRX4tPwA6VTt2',
    database: 'buuuikfhqw5l0acqlcy2',
    waitForConnections: true
});

console.log('Connected to MySQL database');

pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
});

function checkURL(url) {
    return /^https?:\/\//i.test(url);
}

function generateQRCodeData(link) {
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(link, {
            errorCorrectionLevel: 'H',
        }, (err, url) => {
            if (err) {
                reject(err);
            } else {
                const dataImage = `data:image/png;base64,${url.split(',')[1]}`;
                resolve(dataImage);
            }
        });
    });
}

app.post('/users', async (req, res) => {
    const email = req.body.email;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows[0].role != 'Admin') {
            return res.status(400).json({
                code: 400,
                message: 'Your not Admin',
            });
        }
        const [result] = await connection.query('SELECT * FROM users');

        connection.release();

        return res.status(200).json({
            code: 200,
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.get('/hello', (req, res) => {
    res.status(200).json({
        message: 'Hello, World!'
    })
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Please provide both email and password.',
        });
    }
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        connection.release();

        if (rows.length === 1) {
            return res.status(200).json({
                email: rows[0].email,
                role: rows[0].role,
                code: 200,
            });
        } else {
            return res.status(401).json({
                message: 'Authentication failed. Invalid email or password.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({
            code: 400,
            message: 'Please provide email, password, and confirmPassword.',
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            code: 400,
            message: 'Password and confirmPassword do not match.',
        });
    }

    try {
        const connection = await pool.getConnection();
        const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            connection.release();
            return res.status(400).json({
                code: 400,
                message: 'Email already exists. Please choose a different Email.',
            });
        }

        await connection.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, 'User']);

        connection.release();

        return res.status(200).json({
            message: 'Registration successful',
            code: 200
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/generateQR', async (req, res) => {
    const { longUrl, email, newTitle, newBackHalf } = req.body;
    checkURL(longUrl);

    if (!checkURL(longUrl)) {
        return res.status(400).json({
            code: 400,
            message: 'URL is not in the correct pattern',
        });
    }

    if (!longUrl || !email) {
        return res.status(400).json({
            code: 400,
            message: 'Please provide a valid "link" or "email" property in the request body.',
        });
    }
    try {

        const shortLinkId = shortid.generate();
        const queryBackHalf = newBackHalf || shortLinkId;
        const shortLinkUrl = queryBackHalf;

        const domain = 'https://thity-api.cleverapps.io/';

        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
        connection.release();

        if (rows[0].count === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Email address does not exist in the database.',
            });
        }

        const response = await fetch(longUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch the web page');
        }

        const htmlContent = await response.text();
        const root = parse(htmlContent);
        const titleElement = root.querySelector('title');
        const title = titleElement ? titleElement.text : 'No Title Found';

        const faviconLink = root.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        const faviconHref = faviconLink ? faviconLink.getAttribute('href') : null;
        const icon = faviconHref ? new URL(faviconHref, longUrl).toString() : null;

        const queryTitle = newTitle || title;
        const link = `${domain}${shortLinkUrl}`;

        let newQR = await generateQRCodeData(link);

        await connection.query(`
            INSERT INTO link (email, original_link, domain, short_link, qr_code, title, icon, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+07:00'))`, [email, longUrl, domain, shortLinkUrl, newQR, queryTitle, icon]
        );

        return res.status(200).json({
            code: 200,
            email: email,
            domain: domain,
            shortLink: shortLinkUrl,
            longLink: longUrl,
            title: queryTitle,
            icon: icon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/shortLink', async (req, res) => {
    const { longUrl, email, newTitle, newBackHalf } = req.body;
    checkURL(longUrl);

    if (!checkURL(longUrl)) {
        return res.status(400).json({
            code: 400,
            message: 'URL is not in the correct pattern',
        });
    }

    if (!longUrl || !email) {
        return res.status(400).json({
            code: 400,
            message: 'Please provide a valid "link" or "email" property in the request body.',
        });
    }
    try {

        const shortLinkId = shortid.generate();
        const queryBackHalf = newBackHalf || shortLinkId;
        const shortLinkUrl = queryBackHalf;

        const domain = 'https://thity-api.cleverapps.io/';

        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
        connection.release();

        if (rows[0].count === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Email address does not exist in the database.',
            });
        }

        const response = await fetch(longUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch the web page');
        }

        const htmlContent = await response.text();
        const root = parse(htmlContent);
        const titleElement = root.querySelector('title');
        const title = titleElement ? titleElement.text : 'No Title Found';

        const faviconLink = root.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        const faviconHref = faviconLink ? faviconLink.getAttribute('href') : null;
        const icon = faviconHref ? new URL(faviconHref, longUrl).toString() : null;

        const queryTitle = newTitle || title;

        await connection.query(`
            INSERT INTO link (email, original_link, domain, short_link, title, icon, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+07:00'))`, [email, longUrl, domain, shortLinkUrl, queryTitle, icon]
        );

        return res.status(200).json({
            code: 200,
            email: email,
            domain: domain,
            shortLink: shortLinkUrl,
            longLink: longUrl,
            title: queryTitle,
            icon: icon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/redirectOriginal', async (req, res) => {
    const shortLink = req.body.shortLink;
    const connection = await pool.getConnection();
    try {
        const [link] = await connection.query(
            'SELECT original_link FROM link WHERE short_link = ?',
            [shortLink]
        );

        if (link && link.length > 0) {
            const redirectLink = link[0].original_link;
            res.status(200).json({
                redirectURL: redirectLink
            });
        } else {
            res.status(404).json({
                code: 404,
                message: 'Short link not found',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    } finally {
        connection.release();
    }
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT original_link FROM link WHERE short_link = ?', [shortUrl]);
        connection.release();

        if (rows.length > 0) {
            const originalUrl = rows[0].original_link;
            return res.redirect(301, originalUrl);
        } else {
            return res.status(404).json({
                code: 404,
                message: 'Original URL not found.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/getLink', async (req, res) => {
    const email = req.body.email;

    try {
        const connection = await pool.getConnection();
        const rows = await connection.query('SELECT * FROM link WHERE email = ? ORDER BY id DESC', [email]);
        connection.release();

        return res.status(200).json({
            code: 200,
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/getLinkByID', async (req, res) => {
    const id = req.body.id;

    try {
        const connection = await pool.getConnection();
        const rows = await connection.query('SELECT id, title, short_link FROM link WHERE id = ?', [id]);
        connection.release();

        return res.status(200).json({
            code: 200,
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/updateLink', async (req, res) => {
    const { id, editTitle, editBackHalf } = req.body;
    try {
        const connection = await pool.getConnection();

        const result = await connection.query(
            'UPDATE link SET title = ?, short_link = ? WHERE id = ?',
            [editTitle, editBackHalf, id]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Link not found or not updated.',
            });
        }
        return res.status(200).json({
            code: 200,
            message: 'Link updated successfully.',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/deleteLink', async (req, res) => {
    const id = req.body.id;
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM link WHERE id = ?', [id]);
        connection.release();
        return res.status(200).json({
            code: 200,
            message: 'Link deleted successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.post('/deleteUser', async (req, res) => {
    const id = req.body.id;
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        connection.release();
        return res.status(200).json({
            code: 200,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});