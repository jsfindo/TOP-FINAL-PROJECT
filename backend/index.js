const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Enable CORS for Next.js frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// -----------------------------------------------------------------------------
// 1. SESSION & PASSPORT CONFIGURATION
// -----------------------------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport Strategy for Users
passport.use(
  'user-local',
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        console.log(`[AUTH CHECK - USER] Attempting login for email: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
          console.log(`[AUTH FAIL - USER] No user account found with email: ${email}`);
          return done(null, false, { message: 'Incorrect credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log(`[AUTH FAIL - USER] Password mismatch for user: ${email}`);
          return done(null, false, { message: 'Incorrect credentials' });
        }

        console.log(`[AUTH SUCCESS - USER] User authenticated successfully: ${email}`);
        return done(null, { ...user, role: 'user' });
      } catch (err) {
        console.error('[AUTH ERROR - USER] Database or processing error:', err);
        return done(err);
      }
    }
  )
);

// Passport Strategy for Companies
passport.use(
  'company-local',
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        console.log(`[AUTH CHECK - COMPANY] Email: "${email}"`);
        console.log(`[AUTH CHECK - COMPANY] Incoming Plain Password: "${password}"`);

        // Hash the incoming password for inspection
        const hashedInput = await bcrypt.hash(password, 10);
        console.log(`[AUTH CHECK - COMPANY] Incoming Password (Re-hashed): "${hashedInput}"`);

        const company = await prisma.company.findUnique({ where: { email } });

        if (!company) {
          console.log(`[AUTH FAIL - COMPANY] Account not found for email: ${email}`);
          return done(null, false, { message: 'Incorrect credentials' });
        }

        console.log(`[AUTH CHECK - COMPANY] Stored DB Hash:               "${company.password}"`);

        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
          console.log(`[AUTH FAIL - COMPANY] Bcrypt comparison returned false.`);
          return done(null, false, { message: 'Incorrect credentials' });
        }

        console.log(`[AUTH SUCCESS - COMPANY] Authenticated: ${email}`);
        return done(null, { ...company, role: 'company' });
      } catch (err) {
        console.error('[AUTH ERROR - COMPANY]', err);
        return done(err);
      }
    }
  )
);
passport.serializeUser((entity, done) => {
  done(null, { id: entity.id, role: entity.role });
});

passport.deserializeUser(async (serialized, done) => {
  try {
    if (serialized.role === 'user') {
      const user = await prisma.user.findUnique({ where: { id: serialized.id } });
      done(null, user ? { ...user, role: 'user' } : false);
    } else if (serialized.role === 'company') {
      const company = await prisma.company.findUnique({ where: { id: serialized.id } });
      done(null, company ? { ...company, role: 'company' } : false);
    }
  } catch (err) {
    done(err);
  }
});

// Middleware to protect routes by role
function ensureAuthenticated(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    console.log(`[UNAUTHORIZED ACCESS] Attempted access to protected ${role} route by user ID: ${req.user?.id || 'Unauthenticated'}`);
    return res.status(401).json({ error: 'Unauthorized access' });
  };
}

// -----------------------------------------------------------------------------
// 2. AUTHENTICATION ROUTES (Signup, Login, Logout)
// -----------------------------------------------------------------------------

// User Signup
app.post('/api/signup/user', async (req, res) => {
  try {
    const { name, email, password, phone, education, desc, experience, skills } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        education: education || '',
        desc: desc || '',
        experience: experience || '',
        skills: skills || '',
      },
    });

    console.log(`[SIGNUP SUCCESS - USER] Created user ID: ${newUser.id}`);
    return res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('[SIGNUP ERROR - USER]', error);
    return res.status(500).json({ error: 'User signup failed.' });
  }
});

app.post('/api/signup/company', async (req, res) => {
  // CRITICAL DEBUG LOG
  console.log('[SIGNUP BODY RECEIVED]:', req.body);

  try {
    const { name, email, password, location, desc, websitelink } = req.body;

    if (!name || !email || !password || !location) {
      console.log('[REJECTED 400]:', { name, email, password, location });
      return res.status(400).json({ error: 'Name, email, password, and location are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = await prisma.company.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location,
        desc: desc || '',
        websitelink: websitelink || '',
      },
    });

    console.log(`[SUCCESS] Company created with ID: ${newCompany.id}`);
    return res.status(201).json({ message: 'Company registered successfully', companyId: newCompany.id });
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    return res.status(500).json({ error: 'Company signup failed.' });
  }
});

// User Login Route with JSON Error Handlers and Logs
app.post('/api/login/user', (req, res, next) => {
  console.log('[LOGIN REQUEST - USER] Received login request:', req.body.email);
  passport.authenticate('user-local', (err, user, info) => {
    if (err) {
      console.error('[LOGIN ERROR - USER]', err);
      return next(err);
    }
    if (!user) {
      console.log(`[LOGIN REJECTED - USER] Reason: ${info?.message || 'Authentication failed'}`);
      return res.status(401).json({ message: info?.message || 'Invalid email or password.' });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log(`[LOGIN SUCCESS - USER] Session established for ID: ${user.id}`);
      return res.json({ message: 'User logged in successfully', user: req.user });
    });
  })(req, res, next);
});

// Company Login Route
app.post('/api/login/company', (req, res, next) => {
  // LOG RECEIVED CREDS TO TERMINAL
  console.log('[LOGIN REQUEST RECEIVED]:', {
    email: req.body?.email,
    password: req.body?.password,
  });

  passport.authenticate('company-local', (err, company, info) => {
    if (err) {
      console.error('[LOGIN ERROR - COMPANY]', err);
      return next(err);
    }
    if (!company) {
      console.log(`[LOGIN REJECTED - COMPANY] Reason: ${info?.message || 'Authentication failed'}`);
      return res.status(401).json({ message: info?.message || 'Invalid email or password.' });
    }
    req.logIn(company, (err) => {
      if (err) return next(err);
      console.log(`[LOGIN SUCCESS - COMPANY] Session established for ID: ${company.id}`);
      return res.json({ message: 'Company logged in successfully', company: req.user });
    });
  })(req, res, next);
});

// Logout
app.post('/api/logout', (req, res, next) => {
  const entityId = req.user?.id;
  req.logout((err) => {
    if (err) return next(err);
    console.log(`[LOGOUT] User/Company logged out ID: ${entityId}`);
    res.json({ message: 'Logged out successfully' });
  });
});

// -----------------------------------------------------------------------------
// 3. JOB OPENINGS HANDLERS
// -----------------------------------------------------------------------------

// Create Job Opening (Company Only)
app.post('/api/company/createpost', ensureAuthenticated('company'), async (req, res) => {
  try {
    const { title, desc, dateClose } = req.body;
    const companyId = req.user.id;

    if (!title || !desc || !dateClose) {
      return res.status(400).json({ error: 'Title, desc, and dateClose are required.' });
    }

    const newJobOpening = await prisma.jobOpening.create({
      data: {
        companyId,
        title,
        desc,
        dateClose: new Date(dateClose),
      },
    });

    console.log(`[JOB POSTED] Created opening ID ${newJobOpening.id} for company ID ${companyId}`);
    return res.status(201).json({ message: 'Job opening created', jobOpening: newJobOpening });
  } catch (error) {
    console.error('[JOB POST ERROR]', error);
    return res.status(500).json({ error: 'Failed to create job opening' });
  }
});

// Fetch all Job Openings across all companies
app.get('/api/openings', async (req, res) => {
  try {
    const openings = await prisma.jobOpening.findMany({
      include: { company: true },
      orderBy: { id: 'desc' },
    });
    return res.status(200).json(openings);
  } catch (error) {
    console.error('[FETCH OPENINGS ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch job openings' });
  }
});

// Search Job Openings within a specific company
app.get('/api/company/:id/openings', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id, 10);
    const { query } = req.query;

    if (isNaN(companyId)) return res.status(400).json({ error: 'Invalid company ID' });

    const openings = await prisma.jobOpening.findMany({
      where: {
        companyId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { desc: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      include: { _count: { select: { applications: true } } },
      orderBy: { id: 'desc' },
    });

    return res.status(200).json({ companyId, totalResults: openings.length, openings });
  } catch (error) {
    console.error('[COMPANY OPENINGS SEARCH ERROR]', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// -----------------------------------------------------------------------------
// 4. APPLICATION HANDLERS
// -----------------------------------------------------------------------------

// Apply for a job opening (User Only)
app.post('/api/applications', ensureAuthenticated('user'), async (req, res) => {
  try {
    const { openingId } = req.body;
    const userId = req.user.id;

    if (!openingId) return res.status(400).json({ error: 'openingId is required.' });

    const parsedOpeningId = parseInt(openingId, 10);

    // Prevent duplicate applications
    const existingApp = await prisma.application.findFirst({
      where: { userId, openingId: parsedOpeningId },
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this job opening.' });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        openingId: parsedOpeningId,
      },
      include: { user: true, opening: true },
    });

    console.log(`[APPLICATION SUBMITTED] User ID ${userId} applied to opening ID ${parsedOpeningId}`);
    return res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    console.error('[APPLICATION ERROR]', error);
    return res.status(500).json({ error: 'Application submission failed' });
  }
});

// View applications submitted by logged-in user
app.get('/api/applications/me', ensureAuthenticated('user'), async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        opening: {
          include: { company: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error('[FETCH USER APPLICATIONS ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// View all applicants for a specific job opening (Company Only)
app.get('/api/openings/:id/applicants', ensureAuthenticated('company'), async (req, res) => {
  try {
    const openingId = parseInt(req.params.id, 10);

    const opening = await prisma.jobOpening.findUnique({
      where: { id: openingId },
    });

    if (!opening) {
      return res.status(404).json({ error: 'Job opening not found' });
    }

    if (opening.companyId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this job opening' });
    }

    const applications = await prisma.application.findMany({
      where: { openingId },
      include: { user: true },
    });

    return res.status(200).json(applications);
  } catch (error) {
    console.error('[FETCH APPLICANTS ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// -----------------------------------------------------------------------------
// 5. START SERVER
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));