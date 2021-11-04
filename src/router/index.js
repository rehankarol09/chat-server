const express = require('express')
const router = express.Router();

router.get('/',(req,res)=>{
res.send('server is up on 5000:')
}
)

module.exports = router;
