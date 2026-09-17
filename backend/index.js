const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// -----------------------------------------------------------------------------
// 1. SESSION & PASSPORT CONFIGURATION
// -----------------------------------------------------------------------------
app.use(
  session({
    secret: 'your_session_secret_key', // Replace with an env variable in production
    resave: false,
    saveUninitialized: false,
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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: 'Incorrect credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect credentials' });

        return done(null, { ...user, role: 'user' });
      } catch (err) {
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
        const company = await prisma.company.findUnique({ where: { email } });
        if (!company) return done(null, false, { message: 'Incorrect credentials' });

        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect credentials' });

        return done(null, { ...company, role: 'company' });
      } catch (err) {
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

    return res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    return res.status(500).json({ error: 'User signup failed.' });
  }
});

// Company Signup
app.post('/api/signup/company', async (req, res) => {
  try {
    const { name, email, password, location, desc, websitelink } = req.body;
    if (!name || !email || !password || !location) {
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

    return res.status(201).json({ message: 'Company registered successfully', companyId: newCompany.id });
  } catch (error) {
    return res.status(500).json({ error: 'Company signup failed.' });
  }
});

// User & Company Logins
app.post('/api/login/user', passport.authenticate('user-local'), (req, res) => {
  res.json({ message: 'User logged in successfully', user: req.user });
});

app.post('/api/login/company', passport.authenticate('company-local'), (req, res) => {
  res.json({ message: 'Company logged in successfully', company: req.user });
});

// Logout
app.post('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
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
    const companyId = req.user.id; // Automatically gets logged-in company ID

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

    return res.status(201).json({ message: 'Job opening created', jobOpening: newJobOpening });
  } catch (error) {
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
    return res.status(500).json({ error: 'Search failed' });
  }
});

// -----------------------------------------------------------------------------
// 4. APPLICATION HANDLERS
// -----------------------------------------------------------------------------

// Apply for a job opening (User Only)
app.post('/api/applications/apply', ensureAuthenticated('user'), async (req, res) => {
  try {
    const { openingId } = req.body;
    const userId = req.user.id; // Automatically gets logged-in user ID

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

    return res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    return res.status(500).json({ error: 'Application submission failed' });
  }
});

// View all applicants for a specific job opening (Company Only)
app.get('/api/openings/:id/applicants', ensureAuthenticated('company'), async (req, res) => {
  try {
    const openingId = parseInt(req.params.id, 10);

    const applications = await prisma.application.findMany({
      where: { openingId },
      include: { user: true },
    });

    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// -----------------------------------------------------------------------------
// 5. START SERVER
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));