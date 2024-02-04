import jwt from 'jsonwebtoken';

export default function (req, res, next) {

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).send('Access Denied');
        const manager = jwt.verify(token, process.env.SECRET_KEY);
        req.manager = manager;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
}