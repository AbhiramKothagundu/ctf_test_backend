const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const username = encodeURIComponent(process.env.MONGO_USERNAME);
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

const uri = `mongodb+srv://${username}:${password}@bossbelly.6iaip.mongodb.net/?retryWrites=true&w=majority&appName=bossbelly`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));


const teamSchema = new mongoose.Schema({
  teamName: String,
  SetID: String,
  generatedKey: String,
  level1: { type: Boolean, default: false },
  level2: { type: Boolean, default: false },
  level3: { type: Boolean, default: false },
  final: { type: Boolean, default: false },
});

const Team = mongoose.model("Team", teamSchema);
  

var setKey_pairs = {
    1: 249304,
    2: 114025,
    3: 187309
};


// Route to handle POST request to add a team
app.post("/teams", async (req, res) => {
  try {
    const { teamName, SetID, generatedKey } = req.body;

    const newTeam = new Team({ teamName, SetID, generatedKey });

    await newTeam.save();

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "An error occurred while creating the team" });
  }
});

app.get("/verifyLevelOne", async (req, res) => {
    try {
      const numbersval = req.query.numbersval;
      const { setid, teamName } = req.body;
  
      if (!setKey_pairs[setid]) {
        return res.status(400).json({ message: "Invalid setid provided" });
      }
  
      const setKey = setKey_pairs[setid];
      const levelOneKey = String(setKey).slice(0, 2);
  
      if (numbersval === levelOneKey) {
        const updatedTeam = await Team.findOneAndUpdate(
          { teamName: teamName },
          { level1: true },
          { new: true }
        );
  
        if (!updatedTeam) {
          return res.status(404).json({ message: "Team not found" });
        }
  
        return res.status(200).json({
          message: "You have Passed Level1"
        });
      } else {
        return res.status(400).json({ message: "Verification failed" });
      }
    } catch (error) {
      console.error("Error verifying level one:", error);
      res.status(500).json({ message: "An error occurred during verification" });
    }
  });
  

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
