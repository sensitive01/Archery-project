import aboutUsImg from './about_us.png';
import archeryPractice1 from "../assets/archeryPractice1.jpg"
import archeryPractice2 from "../assets/archeryPractice2.jpg"
import archeryPractice3 from "../assets/archeryPractise3.jpg"
import archeryPractice4 from "../assets/archeryPractice5.jpg"
import archeryPractice5 from "../assets/archeryPractise6.jpg"
import archeryPractice6 from "../assets/archeryPractice7.jpg"

export const images = {
    hero: "https://images.unsplash.com/photo-1510925768022-7e72e7cbdef8?fm=jpg&q=80&w=1920&fit=crop", // Using high quality Unsplash image for hero too
    about: aboutUsImg,
    programs: {
        beginner: "https://images.unsplash.com/photo-1554226190-2794eb849646?fm=jpg&q=80&w=800&fit=crop",
        intermediate: "https://images.unsplash.com/photo-1518349619113-03114f06ac3a?fm=jpg&q=80&w=800&fit=crop",
        advanced: "https://images.unsplash.com/photo-1515165592879-1d904289893d?fm=jpg&q=80&w=800&fit=crop",
    },
    gallery: [
        {
            url: archeryPractice1,
            title: "Expert Coaching"
        },
        {
            url: archeryPractice2,
            title: "Focus & Discipline"
        },
        {
            url: archeryPractice3,
            title: "Outdoor Range"
        },
        {
            url: archeryPractice4,
            title: "Equipment Mastery"
        },
        {
            url: archeryPractice5,
            title: "Equipment Mastery"
        },
        {
            url: archeryPractice6,
            title: "Equipment Mastery"
        }
    ],
    auth: "https://images.unsplash.com/photo-1510925768022-7e72e7cbdef8?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    logo: "/src/assets/newLogo.png"
};
