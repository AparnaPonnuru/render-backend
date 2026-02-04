const router = require("express").Router();
const User = require("../models/users.model");


// Check if LX Tag exists
router.get("/checkLXTag", async (req, res) => {
    try {
        const lxTag = req.query.lxTag;
        if (!lxTag) return res.status(400).json({ message: "lxTag is required" });

        const user = await User.findOne({ lxTag });

        return res.json({ available: !user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Check if Banker Tag exists
router.get("/checkBankerTag", async (req, res) => {
    try {
        const bankerTag = req.query.bankerTag;
        if (!bankerTag) return res.status(400).json({ message: "bankerTag is required" });

        const user = await User.findOne({ bankerTag });

        return res.json({ available: !user });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Register a banker
router.post("/register/banker", async (req, res) => {
    try {
        const data = req.body;

        const newUser = new User(data);
        await newUser.save();

        res.json({ message: "Banker registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update banker
router.put("/update/banker", async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        const updated = await User.findOneAndUpdate(
            { email },
            updateData,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "User not found" });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
