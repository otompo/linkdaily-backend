const User = require("../models/user");
const Link = require("../models/link");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/auth");
const nanoid = require("nanoid");
const expressJWT = require("express-jwt");
var cloudinary = require("cloudinary");
// const sendEmail = require("../utils/sendEmail");
const nodemailer = require("nodemailer");

// sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
const sendEmail = async (options) => {
  // 1) create a transporter
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "1953d6ff4c8a58",
      pass: "c1122a5e58187a",
    },
  });
  // 2)Define the email options
  const message = {
    from: `${process.env.EMAIL_FROM_NAME} < ${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };
  // 3) Actually send the email
  await transporter.sendMail(message);
};

// cluodnary

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

cloudinary.config({
  cloud_name: "codesmart",
  api_key: "924552959278257",
  api_secret: "nyl74mynmNWo5U0rzF8LqzcCE8U",
});

// meddleware
exports.requireSignin = expressJWT({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.signup = async (req, res) => {
  try {
    // validation
    const { name, email, password } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
      }).save();

      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      //   console.log(user);
      const { password, ...rest } = user._doc;
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.signin = async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    // check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }
    // create signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // find user by email
  const user = await User.findOne({ email });
  // console.log("USER ===> ", user);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  user.save();
  // prepare email
  // const emailData = {
  //   from: process.env.EMAIL_FROM,
  //   to: user.email,
  //   subject: "Password reset code",
  //   html: `<h1>Your password  reset code is: ${resetCode}</h1>`,
  // };

  // send email
  try {
    const message = `<h1>Your password  reset code is: ${resetCode}</h1>`;
    const data = await sendEmail({
      email: user.email,
      subject: "Your Password reset code",
      // message,
      html: `<h3>Enter this code below in the app to reset your password:\n <h2 style="color:#ff0000">${resetCode}</h2>\n\n</h3>`,
    });
    // console.log(data);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, resetCode } = req.body;
    // find user based on email and resetCode
    const user = await User.findOne({ email, resetCode });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetCode = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

exports.uploadImage = async (req, res) => {
  try {
    // console.log("upload image", req.user._id);
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      public_id: nanoid(),
      folder: "linksdaily/img",
      // width: "150",
      // crop: "scale",
    });
    // console.log(result);
    // save image in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      },
      { new: true }
    );
    return res.json({
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and must be min 6 charaters long",
      });
    } else {
      // update password
      const hashedPassword = await hashPassword(password);
      const user = await User.findByIdAndUpdate(req.user._id, {
        password: hashedPassword,
      });
      user.password = undefined;
      user.secret = undefined;
      return res.json(user);
    }
  } catch (err) {
    console.log(err);
  }
};

// exports.userProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId).select(
//       "-password -secret"
//     );
//     res.send(user);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "-password -secret"
    );
    const userlinks = await Link.find({ postedBy: req.params.userId })
      .select("urlPreview views likes")
      .populate("postedBy", "_id")
      .sort({ createdAt: -1 });
    res.send({ user, userlinks });
  } catch (err) {
    console.log(err);
  }
};
