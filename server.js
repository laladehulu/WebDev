const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Contestant = require('./Schemas/contestant');


mongoose.connect(process.env.db_url, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/contestants',bodyParser.json(),async (req,res)=>{
    try {
        const { contestantName, husbandName, vocalRange, location } = req.body;
    
        if (!contestantName || !husbandName || vocalRange === undefined || location === undefined) {
          return res.status(400).json({ error: 'ERROR:All fields are required, currently missing: '+(!contestantName?'contestantName ':'')+(!husbandName?'husbandName ':'') + (vocalRange===undefined?'vocalRange ':'') + (location===undefined?'location':'')  });
        }
    
        const contestant = new Contestant({ contestantName, husbandName, vocalRange, location });
        await contestant.save();
    
        res.status(200).json({ message: 'ERROR: Contestant registered successfully', contestant });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})
app.get('/contestants', async (req, res) => {
    try {
    
       let contestants = await (req.query.sortedByName === 'true'?Contestant.find().sort({ contestantName: 1 }):Contestant.find())
        contesntants = contesntants.map((ele)=> ({
            contestantName: ele.contestantName,
            husbandName: ele.husbandName
        }))
      
      res.json({ pairs: contesntants });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  function scoreCalc(vocalRange, location, inventory){
    let realRange = vocalRange + inventory.reduce((a,b)=>(a+b.boost),0)
    return realRange === location?location: Math.abs(location - vocalRange)
  }
  app.get('/husbandCall/:contestantName', async (req, res) => {
    try {
       const {contesntantName} = req.params.contestantName
      const contestant = await Contestant.findOne({ contestantName});
      if (!contestant) {
        return res.status(404).json({ error: 'ERROR: cannot find contestant' });
      }
      const { vocalRange, location,inventory } = contestant;
      if(score<location){
        return res.status(400).json({ error: 'ERROR: the contestant vocal range cannot reach husband, L' });
      }
      let score = scoreCalc(vocalRange, location,inventory )
      res.json({ score });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get('/bestShout  ', async (req, res) => {
    try {
      const contestant = await Contestant.find();
      if (contestant.length == 0) {
        return res.status(404).json({ error: 'ERROR: no contestant wut' });
      }
      //assumed no ties
      const sortedScore = contestant.map((ele)=>({
        score: ele.vocalRange === scoreCalc(ele.vocalRange,ele.location),
        contestantName: ele.contestantName
      })).sort((contestant1, contestant2)=>{
            return contestant1-contestant2
      })
      res.json(sortedScore[0])
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post('/buyItem/:contestantName', async (req, res) => {
    try {
      const { contestantName } = req.params;
      const { item, boost } = req.body;
      const contestant = await Contestant.findOne({ contestantName });
      if (!contestant) {
        return res.status(404).json({ error: 'ERROR:Contestant not found' });
      }
      contestant.inventory.push({ item, boost });
      await contestant.save();
      res.json({ inventory: contestant.inventory.map(i => i.item)});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})