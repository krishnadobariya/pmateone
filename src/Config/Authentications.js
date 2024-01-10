// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const apiResponse = require('../Components/apiresponse');
const Users = require('../Models/UserModel');
require('dotenv').config();

function detaisByJwt(req) {
  const  secret = 'kjdhfkjsdhfkhs43$%#%#^546%$76%*$75543654%$^$@%hgf%$65eD654WE6$E6$eDYReD&%E7%e&^';
  if (req.headers && req.headers.authorization) {
    const { authorization } = req.headers;
    let decoded;
    decoded = jwt.verify(authorization, secret);
    return {
      id: decoded._id,
      role: decoded.role,
    };
  }
  return 'something went wrong';
}

module.exports = {
  createToken: (_id, role) => {
    const { secret } = process.env;
    return jwt.sign({ role, _id }, secret || 'kjdhfkjsdhfkhs43$%#%#^546%$76%*$75543654%$^$@%hgf%$65eD654WE6$E6$eDYReD&%E7%e&^', {
      expiresIn: "30d",
    });
  },

  adminAuth: (req, res, next) => {
    const { secret } = process.env || 'kjdhfkjsdhfkhs43$%#%#^546%$76%*$75543654%$^$@%hgf%$65eD654WE6$E6$eDYReD&%E7%e&^';
    const token = req.headers['authorization'] || req.headers.authorization; // Express headers are auto converted to lowercase
    if (token) {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          return apiResponse.authenticationToken(res, 'Authentication Token Is Not Valid');
        }
        const userData = detaisByJwt(req);
        if (userData.role === 'admin') {
          req.decoded = decoded;
          next();
        } else {
          return apiResponse.authenticationToken(res, 'Forbidden for your role');
        }
      });
    } else {
      return apiResponse.authenticationToken(res, 'Authentication Token Is Not Supplied');
    }
  },

  userAuth: (req, res, next) => {
    const  secret  = 'kjdhfkjsdhfkhs43$%#%#^546%$76%*$75543654%$^$@%hgf%$65eD654WE6$E6$eDYReD&%E7%e&^';
    const token = req.headers['authorization'] || req.headers.authorization; // Express headers are auto converted to lowercase
    if (token) {
      jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
          return apiResponse.authenticationToken(res, 'Authentication Token Is Not Valid');
        }
        const userData = detaisByJwt(req);
        console.log('userData---->', userData)
        const userInfo = await Users.findOne({ _id: userData.id }, { token: 1 })
        if (userData && userInfo) {
          if (userData.role === 'customer' && token === userInfo.token
              || userData.role === 'vet' && token === userInfo.token
              || userData.role === 'seller' && token === userInfo.token
              || userData.role === 'admin' && token === userInfo.token) {
            req.decoded = decoded;
            next();
          } else {
            return apiResponse.authenticationToken(res, 'Authentication Token Is Not Valid');
          }
        } else {
          return apiResponse.authenticationToken(res, 'Authentication Token Is Not Valid');
        }
      });
    } else {
      return apiResponse.authenticationToken(res, 'Authentication Token Is Not Supplied');
    }
  },
};
