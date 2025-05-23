import jwt from 'jsonwebtoken';

export default function (req, res, next) {

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).send('Invalid Token');
        const proprietor = jwt.verify(token, process.env.SECRET_KEY);
        req.proprietor = proprietor;
        next();
    } catch (err) {
        res.status(401).send('Invalid Token');
    }
}