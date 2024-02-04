import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Proprietor from "../models/proprietor.js";


export const newProprietor = async (req, res) => {

    console.log(req.body);
    const { name, proprietor_id, password } = req.body;

    try {
        const oldProprietor = await Proprietor.findOne({ proprietor_id });

        if (oldProprietor) return res.status(400).json({ message: "Proprietor already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        // const result = await Proprietor.create({ name, id, password: hashedPassword });

        const result = await Proprietor.create({ name, proprietor_id, password: hashedPassword });

        // const token = jwt.sign({ id: result._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        const proprietor_token = jwt.sign({ proprietor_id: result.proprietor_id }, process.env.SECRET_KEY, { expiresIn: "1h" });


        console.log(result);
        res.status(200).json({ result: { name: result.name, proprietor_id: result.proprietor_id }, proprietor_token });

        // res.status(200).json({ message: "Proprietor created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};

export const loginProprietor = async (req, res) => {
    console.log(req.body);
    const { proprietor_id, password } = req.body;

    try {
        const oldProprietor = await Proprietor.findOne({ proprietor_id });

        if (!oldProprietor) return res.status(404).json({ message: "Proprietor doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, oldProprietor.password);

        // const isPasswordCorrect = (password === oldProprietor.password);

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const proprietor_token = jwt.sign({ proprietor_id: oldProprietor.proprietor_id }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // res.status(200).json({ result: oldProprietor, token });

        return res.status(200).json({ result: { proprietor_id: oldProprietor.proprietor_id, name: oldProprietor.name }, proprietor_token });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};

