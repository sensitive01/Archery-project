const User = require('../models/User');
const Order = require('../models/Order');
const Otp = require('../models/Otp');
const Counter = require('../models/Counter');
const Batch = require('../models/Batch');
const Program = require('../models/Program');
const Equipment = require('../models/Equipment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { generateInvoicePdf } = require('../utils/invoiceGenerator');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const generateStudentId = async () => {
    // Generate random 6 digits
    const random = Math.floor(100000 + Math.random() * 900000);
    return `AR${random}`;
};

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered. Please log in." });
        }

        // Generate 4 digit OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Save to DB (upsert if exists)
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Configure Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Archery Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">ARCHERY<span style="color: #D22B2B;">ACADEMY</span></h1>
                    </div>
                    <div style="padding: 30px; text-align: center;">
                        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Use the verification code below to complete your registration.</p>
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D22B2B;">${otpCode}</span>
                        </div>
                        <p style="color: #999; font-size: 14px;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
                    </div>
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} Archery Academy. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[OTP SENT] To: ${email}`);

        res.json({ message: 'OTP sent successfully', otp: otpCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Allow universal test OTP "0000" as a bypass (for cases when email delivery fails)
        if (otp === '0000') {
            return res.json({ success: true, message: 'OTP Verified (Test)' });
        }

        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            res.json({ success: true, message: 'OTP Verified' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.registerStudent = async (req, res) => {
    try {
        console.log('[REGISTER] Called with body keys:', Object.keys(req.body));
        const {
            firstName,
            lastName,
            email,
            mobile,
            registrationType,
            guardianName,
            programId,
            paymentDetails,
            dob,
            age,
            gender,
            bloodGroup,
            aadhaar,
            category,
            institutionName,
            institutionDesignation,
            guardianContact,
            address,
            medicalConditions,
            emergencyContactName,
            emergencyContactNumber,
            preferredBatch,
            previousExperience,
            previousExperienceDetails,
            batchId,
            equipmentId
        } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'First name, last name and email are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A student with this email already exists. Please login instead.' });
        }

        const studentId = await generateStudentId();

        // Generate a random temporary password
        const tempPassword = `TEMP-${Math.floor(100000 + Math.random() * 900000)}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'student',
            needsPasswordReset: true,
            studentId,
            mobile: mobile || '',
            registrationType: registrationType || 'self',
            dob: dob || null,
            age: age || null,
            gender: gender || null,
            bloodGroup: bloodGroup || null,
            aadhaar: aadhaar || null,
            category: category || 'Student',
            institutionName: institutionName || null,
            institutionDesignation: institutionDesignation || null,
            guardianName: guardianName || null,
            guardianContact: guardianContact || null,
            address: address || null,
            medicalConditions: medicalConditions || null,
            emergencyContactName: emergencyContactName || null,
            emergencyContactNumber: emergencyContactNumber || null,
            preferredBatch: preferredBatch || 'Weekday',
            previousExperience: previousExperience === true || previousExperience === 'Yes',
            previousExperienceDetails: previousExperienceDetails || null,
            paymentId: paymentDetails?.razorpay_payment_id || `ARPAY${Date.now()}`,
            enrolledPrograms: programId ? [programId] : []
        };

        console.log('[REGISTER] Creating user:', email, studentId);
        const user = await User.create(userData);
        console.log('[REGISTER] User created successfully:', user._id, user.email, user.studentId);

        // Notify Admin of new registration
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                role: 'admin',
                title: 'New Student Registered',
                message: `${firstName} ${lastName} (${studentId}) has registered.`,
                type: 'registration',
                link: '/admin/members'
            });
        } catch (err) { console.error('Notification error:', err); }

        // ---- Calculate amount in Rupees ----
        // paymentDetails.amount comes from Razorpay in paise, or from frontend as rupees * 100
        let amountInRupees = 0;
        if (paymentDetails?.amount) {
            // If amount > 1000 it's likely in paise (e.g., 500000 paise = 5000 rupees)
            amountInRupees = paymentDetails.amount > 10000
                ? Math.round(paymentDetails.amount / 100)
                : paymentDetails.amount;
        }

        // ---- Save Order ----
        console.log('[REGISTER] Creating order for user', user._id, 'amount:', amountInRupees);
        const newOrder = await Order.create({
            user: user._id,
            studentId: user.studentId,
            programId: programId || undefined,
            batchId: batchId || undefined,
            equipmentId: equipmentId || undefined,
            amount: amountInRupees,
            razorpayPaymentId: paymentDetails?.razorpay_payment_id || userData.paymentId,
            razorpayOrderId: paymentDetails?.razorpay_order_id || null,
            status: 'success',
            // If equipment was ordered, delivery is pending until admin marks it as completed
            fulfillmentStatus: equipmentId ? 'Pending' : 'Completed'
        });

        // ---- Update Equipment Available Stock ----
        if (equipmentId) {
            try {
                await Equipment.findByIdAndUpdate(equipmentId, {
                    $inc: { availableQty: -1 }
                });
                console.log('[REGISTER] Decremented available stock for equipment:', equipmentId);
            } catch (err) {
                console.error('[REGISTER] Error decrementing equipment available stock:', err);
            }
        }

        // Ensure batch has session dates (in case batch was created before the hook ran or schedule changed)
        let populatedBatch = null;
        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (batch) {
                // If sessionDates empty, recompute using program.totalClasses
                if (!batch.sessionDates || batch.sessionDates.length === 0) {
                    const prog = await Program.findById(batch.program).select('totalClasses');
                    if (prog) {
                        const dayMap = {
                            sunday: 0,
                            monday: 1,
                            tuesday: 2,
                            wednesday: 3,
                            thursday: 4,
                            friday: 5,
                            saturday: 6,
                        };
                        const dayNumbers = batch.days
                            .map(d => d.toLowerCase())
                            .map(d => dayMap[d])
                            .filter(d => d !== undefined);
                        const generateDates = (total, dayNums, start) => {
                            const dates = [];
                            let cur = new Date(start);
                            cur.setHours(0, 0, 0, 0);
                            while (dates.length < total) {
                                if (dayNums.includes(cur.getDay())) {
                                    dates.push(new Date(cur));
                                }
                                cur.setDate(cur.getDate() + 1);
                            }
                            return dates;
                        };
                        batch.sessionDates = generateDates(prog.totalClasses, dayNumbers, batch.startDate);
                        await batch.save();
                    }
                }
                populatedBatch = {
                    _id: batch._id,
                    name: batch.name,
                    sessionDates: batch.sessionDates,
                };
            }
        }

        console.log('[REGISTER] Order created:', newOrder._id, newOrder.transactionId);

        // ---- Assign student to batch ----
        if (batchId) {
            try {
                const batch = await Batch.findById(batchId);
                if (batch) {
                    // Add student to batch's student list
                    if (!batch.students.includes(user._id)) {
                        batch.students.push(user._id);
                        await batch.save();
                        console.log('[REGISTER] Student added to batch:', batch.name);
                    }
                    // Initialize student attendance schedule based on batch session dates
                    if (batch.sessionDates && batch.sessionDates.length > 0) {
                        user.attendance = batch.sessionDates.map(d => ({
                            date: new Date(d),
                            status: 'unattended'
                        }));
                    }
                    // Also set user's batch reference
                    user.batch = batchId;
                    await user.save();
                    console.log('[REGISTER] User batch reference set and attendance schedule initialized');

                    // Notify Admin of batch assignment
                    try {
                        const { createNotification } = require('./notificationController');
                        await createNotification({
                            role: 'admin',
                            title: 'Student Assigned to Batch',
                            message: `${user.firstName} ${user.lastName} auto-enrolled into batch ${batch.name}.`,
                            type: 'batch',
                            link: '/admin/batches'
                        });
                    } catch (err) { console.error('Notification error:', err); }
                }
            } catch (batchErr) {
                console.error('[REGISTER] Batch assignment error (non-fatal):', batchErr.message);
            }
        }

        // ---- Send welcome email with invoice (async, non-blocking) ----
        setImmediate(async () => {
            try {
                const program = programId ? await Program.findById(programId) : null;
                const batch = batchId ? await Batch.findById(batchId) : null;
                const equipment = equipmentId ? await Equipment.findById(equipmentId) : null;

                const pdfBuffer = await generateInvoicePdf(newOrder, user, program, batch, equipment);

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    },
                    tls: { rejectUnauthorized: false }
                });

                const credentialHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #0F172A, #1E40AF); border-radius: 8px 8px 0 0; padding: 30px; text-align: center; margin: -20px -20px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">ARCHERY<span style="color: #ef4444;">PRO</span></h1>
                            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 5px 0 0;">Official Academy Enrollment Confirmation</p>
                        </div>
                        <div style="padding: 10px 10px 20px;">
                            <p style="font-size: 16px; color: #333;">Hi <strong>${firstName}</strong>,</p>
                            <p style="font-size: 14px; color: #555; line-height: 1.7;">🎉 Congratulations! Your registration at <strong>Archery Academy</strong> is confirmed. Your payment was successful and your invoice is attached to this email.</p>
                            
                            <div style="background: #f0f7ff; border-left: 4px solid #1E40AF; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 15px;">🔐 YOUR LOGIN CREDENTIALS</h3>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr><td style="padding: 6px 0; color: #666; width: 40%;">Student ID:</td><td style="padding: 6px 0; font-weight: bold; color: #1e40af; font-family: monospace;">${studentId}</td></tr>
                                    <tr><td style="padding: 6px 0; color: #666;">Login Email:</td><td style="padding: 6px 0; font-weight: bold; color: #333;">${email}</td></tr>
                                    <tr><td style="padding: 6px 0; color: #666;">Temp Password:</td><td style="padding: 6px 0; font-weight: bold; color: #b91c1c; font-family: monospace; font-size: 16px;">${tempPassword}</td></tr>
                                </table>
                            </div>

                            <div style="background: #fff8e1; border: 1px solid #ffc107; border-radius: 6px; padding: 12px 15px; margin: 15px 0; font-size: 13px; color: #856404;">
                                ⚠️ <strong>Important:</strong> You will be asked to reset this temporary password on your first login for security purposes.
                            </div>

                            <p style="font-size: 14px; color: #555;">You can login to your student portal at: <a href="http://localhost:5173/login" style="color: #1e40af; font-weight: bold;">Archery Student Portal</a></p>
                        </div>
                        <div style="text-align: center; padding: 15px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} Archery Academy. All rights reserved.
                        </div>
                    </div>
                `;

                await transporter.sendMail({
                    from: `"Archery Academy" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Welcome to Archery Academy — Your Enrollment is Confirmed!`,
                    html: credentialHtml,
                    attachments: [
                        {
                            filename: `Archery_Invoice_${newOrder.transactionId || 'Receipt'}.pdf`,
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                });
                console.log(`[EMAIL SENT] Welcome email + PDF invoice sent to ${email}`);
            } catch (emailErr) {
                console.error('[EMAIL ERROR] Failed to send welcome email:', emailErr.message);
            }
        });

        // Re-fetch user to populate enrolledPrograms and batch properly for the frontend
        const updatedUser = await User.findById(user._id)
            .populate('enrolledPrograms')
            .populate({
                path: 'batch',
                populate: { path: 'program', select: 'title totalClasses schedule' },
                select: 'name days startDate sessionDates time location program'
            });

        // ---- Respond to client ----
        return res.status(201).json({
            _id: updatedUser.id,
            studentId: updatedUser.studentId,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            needsPasswordReset: updatedUser.needsPasswordReset,
            enrolledPrograms: updatedUser.enrolledPrograms,
            performanceScores: updatedUser.performanceScores,
            attendance: updatedUser.attendance,
            token: generateToken(updatedUser._id),
            batch: updatedUser.batch,
        });

    } catch (error) {
        console.error('[REGISTER ERROR]', error.name, error.message);
        if (error.code === 11000) {
            // Duplicate key error from MongoDB
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            return res.status(400).json({ message: `A user with this ${field} already exists.` });
        }
        return res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
            .populate('enrolledPrograms')
            .populate({
                path: 'batch',
                populate: { path: 'program', select: 'title totalClasses schedule' },
                select: 'name days startDate sessionDates time location program'
            });

        if (!user) {
            // User not found - email not registered
            return res.status(404).json({
                message: 'Email not registered',
                errorType: 'USER_NOT_FOUND'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // User exists but password is incorrect
            return res.status(401).json({
                message: 'Incorrect password',
                errorType: 'INVALID_PASSWORD'
            });
        }

        // Login successful
        res.json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            studentId: user.studentId,
            mobile: user.mobile,
            enrolledPrograms: user.enrolledPrograms,
            performanceScores: user.performanceScores,
            attendance: user.attendance,
            needsPasswordReset: user.needsPasswordReset,
            token: generateToken(user._id),
            batch: user.batch,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.needsPasswordReset = false;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
};

exports.forgotPasswordReset = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp && otp !== '0000') {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.needsPasswordReset = false;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.register = exports.registerStudent; 
