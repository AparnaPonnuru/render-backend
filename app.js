/**
 * ============================
 *   🌍 NAAVIVERSE BACKEND
 *   Express Application Setup
 * ============================
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var axios = require('axios');
const AWS = require('aws-sdk');
var cors = require('cors');
var mongoose = require('mongoose');

const app = express();
const adminAuthRoutes = require('./Admin/routes/adminAuthRoutes');
/* ------------------- AWS CONFIG ------------------- */
AWS.config.update({ region: 'ap-south-1' });
const s3 = new AWS.S3();

/* ------------------- ROUTER IMPORTS ------------------- */
/* ------------------- ROUTER IMPORTS ------------------- */
var indexRouter = require('./routes/index');
var authRouter = require('./routes/authRouter');
var servicesRouter = require('./routes/servicesRouter');
var adminServicesRouter = require('./routes/adminServicesRouter');
var usersRouter = require('./routes/usersRouter');
var universitiesRouter = require('./routes/universitiesRouter');
var pathsRouter = require('./routes/pathRouter');
var userpathRouter = require('./routes/userpathRouter');
var preLoginRouter = require('./routes/preLoginRouter');
var userPersonalityRouter = require('./routes/userPersonalityRouter');
var partnerRouter = require('./routes/partnerRouter');
var adminRouter = require('./routes/adminRouter');
var personalityRouter = require('./routes/personalityRouter');
var programRouter = require('./routes/programRouter');
var uploadRouter = require('./routes/uploadRouter'); // <-- ADD THIS
var visitorRoutes = require('./Admin/routes/VisitorRoute');

/* ------------------- NEW CORRECT STEPS ROUTER ------------------- */
const stepsRouter = require("./routes/stepsRouter");
const adminDashboardRoutes = require("./Admin/routes/adminDashboardRoutes");
const subscriptionRoutes = require("./Admin/routes/subscriptionRoutes");
const contactRoutes = require('./Admin/routes/contactRoutes');
/* ------------------- APP SETUP ------------------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Handle large payloads */
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

/* ------------------- DATABASE CONNECTION ------------------- */
const database_url = process.env.DATABASE_URI;

mongoose
  .connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

/* ------------------- CORS CONFIG ------------------- */
app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL
  ],
  credentials: true,
}));


const currencyRoutes = require("./routes/currency.route");
app.use("/api", currencyRoutes);

const countryRoutes = require('./routes/countryRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');

/* ------------------- FIXED STEPS ROUTER MOUNT ------------------- */
app.use("/api/steps", stepsRouter);   // ✅ correct mount

const stepViewsRoute = require("./routes/stepviews.route");
app.use("/api/stepviews", stepViewsRoute);

/* ------------------- NO-CACHE ------------------- */
app.use('/api/users', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

/* ------------------- API ROUTES ------------------- */
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter); // <-- ADD THIS

/* -------- FIXED: only ONE mount for services -------- */
app.use('/api/services', servicesRouter);   // ✅ keep this only

app.use('/admin/services', adminServicesRouter);
// auth routes (register/login/reset)
app.use('/api/admin/auth', adminAuthRoutes);

// admin dashboard routes

app.use('/api/universities', universitiesRouter);
app.use("/api/perplexity", require("./routes/perplexity.route"));
app.use("/api/regenerate", require("./routes/regenerateAll.route"));
app.use("/api/crm", require("./routes/crmRoutes"));
app.use('/api/paths', pathsRouter);
app.use('/api/fetch', userpathRouter);
app.use('/api/pre_login', preLoginRouter);
app.use('/api/userAnswers', userPersonalityRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/personality', personalityRouter);
app.use("/api/payment", require("./routes/paymentRoutes"));
//app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/admin-subscribe", subscriptionRoutes);
app.use('/api/admin-contact', contactRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api", require("./routes/checkFormatted"));
app.use("/api/regenerate", require("./routes/regenerateBatch.route"));
app.use("/api/utils", require("./routes/addStepIds.route"));
app.use("/api/stepviews", require("./routes/stepviews.route"));
app.use("/api/vault", require("./routes/vaultRouter"));
app.use("/api/categories", require("./routes/categoriesRouter"));



/* TEMP ADMIN */
app.use("/admin/universities", require("./routes/adminUniversitiesRouter"));
app.use("/admin/programs", require("./routes/adminProgramsRouter"));
app.use("/admin/steps", require("./routes/adminStepsRouter"));
app.use("/admin/services", require("./routes/adminServicesRouter"));

app.use('/api/userpaths', userpathRouter);
app.use('/api/countries', countryRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);


/* ------------------- VISITOR ROUTES ------------------- */
app.use('/api/admin-visitors', visitorRoutes);

/* ------------------- ERROR HANDLING ------------------- */
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;