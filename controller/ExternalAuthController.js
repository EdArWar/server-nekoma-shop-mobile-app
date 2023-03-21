const ExternalUser = require("../models/ExternalUser");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const config = require("config");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, config.get("secretKey"), { expiresIn: "24h" });
};

class ExternalAuthController {
  registration = async (req, res) => {
    try {
      const {
        externalId,
        providerId,
        firstName,
        lastName,
        fullName,
        email,
        avatar,
      } = req.body;

      const userRole = await Role.findOne({ value: "USER" });

      const user = await ExternalUser.create({
        externalId,
        providerId,
        firstName,
        lastName,
        fullName,
        email,
        avatar,
        favorite: [],
        products: [],
        roles: [userRole.value],
      });
      await user.save();

      const token = generateAccessToken(user._id, "USER");

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          providerId: providerId,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          favorites: user.favorite,
          userCart: user.products,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ ...error });
    }
  };

  login = async (req, res) => {
    const { email } = req.body;

    const user = await ExternalUser.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ ErrorMessage: `E-mail ${email} not found` });
    }

    const token = generateAccessToken(user._id, "USER");

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        providerId: user.providerId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        favorites: user.favorite,
        userCart: user.products,
      },
    });
  };

  signIn = async (req, res) => {
    try {
      const { email, externalId } = req.body;

      const candidate = await ExternalUser.findOne({ email });

      const candidateByExternalId = await ExternalUser.findOne({
        externalId,
      });

      if (candidate) {
        if (candidate?.id === candidateByExternalId?.id) {
          this.login(req, res);
        } else if (candidate?.id !== candidateByExternalId?.id) {
          return res
            .status(400)
            .json({ message: "This email exists under another service" });
        } else {
          return res
            .status(400)
            .json({ message: `User with ${email} already exist` });
        }
      } else {
        this.registration(req, res);
      }
    } catch (error) {
      console.log("signIn error", error);
    }
  };
  auth = async (req, res) => {};
}

module.exports = new ExternalAuthController();
