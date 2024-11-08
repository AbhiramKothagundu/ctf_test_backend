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

app.get("/verifyLevel", async (req, res) => {
    try {
      const numbersval = req.query.numbersval;  // The number to verify
      const level = req.query.level;             // The level number (1, 2, or 3)
      const { setid, teamName } = req.body;      // Team Name and SetID from the body
    
      // Validate if the level is between 1 and 3
      if (level < 1 || level > 3) {
        return res.status(400).json({ message: "Invalid Level" });
      }
    
      // Validate the SetID against the predefined setKey_pairs
      if (!setKey_pairs[setid]) {
        return res.status(400).json({ message: "Invalid setid provided" });
      }
  
      const setKey = setKey_pairs[setid];
      
      // Extract the correct digits for comparison based on the level
      let levelKey = String(setKey).slice((level - 1) * 2, (level - 1) * 2 + 2); 
  
      if (numbersval === levelKey) {
        const levelUpdate = {};
        levelUpdate[`level${level}`] = true;
  
        const updatedTeam = await Team.findOneAndUpdate(
          { teamName: teamName },
          levelUpdate,  // Update the corresponding level field to true
          { new: true }
        );
  
        if (!updatedTeam) {
          return res.status(404).json({ message: "Team not found" });
        }
  
        return res.status(200).json({
          message: `You have passed Level ${level}`
        });
      } else {
        return res.status(400).json({ message: "Verification failed" });
      }
    } catch (error) {
      console.error("Error verifying level:", error);
      res.status(500).json({ message: "An error occurred during verification" });
    }
  });
  
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
