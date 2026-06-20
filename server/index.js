require('dotenv').config();
// Server Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // You can change this to your specific frontend URL for better security
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Enable trust proxy if running behind a reverse proxy (like Nginx, Heroku, Render)
// This fixes the 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR' error with express-rate-limit
app.set('trust proxy', 1);

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests (or specifically to `/api/`)
app.use('/api/', apiLimiter);

// Seed Admin User
const seedAdmin = async () => {
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');

        const adminEmail = 'archeryadmin@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            await User.create({
                firstName: 'Archery',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected to archery_db');
        seedAdmin();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/payandplay', require('./routes/payAndPlay'));
app.use('/api/events', require('./routes/events'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
    res.send('Archery Coaching API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
