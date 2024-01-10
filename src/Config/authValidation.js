const jwt = require("jsonwebtoken");


const verifyUser = async (req,res,next) => {
  const authHeader = req.headers['authorization'];
  
  let token = "";

  if(authHeader){
    token = authHeader.split(' ')[1];
  }else{
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  }

  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, "snuggle", function (err, decoded) {
    if (err)
      return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });

    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    // console.log(decoded.id);

    next();
  });
}

module.exports = verifyUser