const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { name, description, image, date, time, location, maxParticipants } = req.body;
        const newEvent = new Event({ name, description, image, date, time, location, maxParticipants });
        const savedEvent = await newEvent.save();

        // Notify all students of new event
        try {
            const { createNotification } = require('./notificationController');
            await createNotification({
                userId: null,
                role: 'student',
                title: 'New Event Posted',
                message: `Check out the new event: ${name}!`,
                type: 'event',
                link: '/events'
            });
        } catch(err) { console.error('Notification error:', err); }

        res.status(201).json(savedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error creating event' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error updating event' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error deleting event' });
    }
};

exports.enrollInEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile } = req.body;

        if (!name || !email || !mobile) {
            return res.status(400).json({ message: 'Name, email, and mobile are required' });
        }

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.enrollments.length >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is already full' });
        }

        // Check if email already enrolled
        const alreadyEnrolled = event.enrollments.some(e => e.email === email);
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Email already enrolled in this event' });
        }

        event.enrollments.push({ name, email, mobile });
        await event.save();
        
        res.status(200).json({ message: 'Successfully enrolled', event });
    } catch (error) {
        console.error('Error enrolling in event:', error);
        res.status(500).json({ message: 'Server error enrolling in event' });
    }
};

exports.removeEnrollment = async (req, res) => {
    try {
        const { id, enrollmentId } = req.params;
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.enrollments.pull({ _id: enrollmentId });
        await event.save();

        res.json({ message: 'Enrollment removed successfully', event });
    } catch (error) {
        console.error('Error removing enrollment:', error);
        res.status(500).json({ message: 'Server error removing enrollment' });
    }
};
