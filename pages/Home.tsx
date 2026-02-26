import React from 'react';
import { Layout } from '../components/Layout';
import { BookingWidget } from '../components/BookingWidget';
import { Button } from '../components/Button';
import { Shield, Clock, Smile, MapPin, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="bg-white p-6 rounded-lg shadow-light border border-gray-100 flex flex-col items-center text-center hover:shadow-medium transition-shadow">
    <div className="bg-blue-50 p-4 rounded-full text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-brand-dark">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
  </div>
);

const ReviewCard: React.FC<{ name: string; date: string; text: string }> = ({ name, date, text }) => (
  <div className="bg-white p-6 rounded-lg shadow-light border border-gray-100">
    <div className="flex text-yellow-400 mb-2">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
    </div>
    <p className="text-gray-700 text-sm italic mb-4">"{text}"</p>
    <div className="flex justify-between items-center text-xs text-gray-500">
      <span className="font-bold text-brand-dark">{name}</span>
      <span>{date}</span>
    </div>
  </div>
);

export const Home: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-white pt-20 pb-24 md:pb-32 px-4 relative overflow-hidden" style={{ backgroundImage: "url('/homepage-hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-brand-dark/60"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Start your holiday <br className="hidden md:block"/> the simple way.
          </h1>
          <p className="text-lg md:text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Secure, affordable off-site parking with fast shuttles to all Southampton cruise terminals. Book in minutes.
          </p>
        </div>
      </section>

      {/* Booking Widget Wrapper */}
      <section className="px-4 mb-20">
        <BookingWidget />
      </section>

      {/* Features / Reassurance */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield size={32} />}
            title="Safe & Secure"
            text="Fully fenced, CCTV monitored facility with gated access and ADT security. Nightly patrols ensure your vehicle is safe around the clock."
          />
          <FeatureCard 
            icon={<Truck size={32} />}
            title="Fast Free Shuttle"
            text="Our on-demand minibuses get you to the terminal in 10 minutes. We drop you right at the baggage drop."
          />
          <FeatureCard 
            icon={<Smile size={32} />}
            title="Rated 5 Stars"
            text="Hundreds of happy cruisers trust us every year. Check our Google Reviews to see why."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">How It Works</h2>
            <p className="text-gray-600">Simple drop-off and pick-up process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-blue-100 -z-10"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-white">1</div>
              <h3 className="text-xl font-bold mb-3">Arrive & Park</h3>
              <p className="text-gray-600 text-sm">Drive to our secure facility. Our team will check you in and help with luggage.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-white">2</div>
              <h3 className="text-xl font-bold mb-3">Shuttle Transfer</h3>
              <p className="text-gray-600 text-sm">Hop on our comfortable shuttle. It's a short 10-minute ride to your terminal.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-white">3</div>
              <h3 className="text-xl font-bold mb-3">Return Pickup</h3>
              <p className="text-gray-600 text-sm">Call us when you disembark. We'll pick you up and take you straight back to your car.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-2">Recent Reviews</h2>
              <p className="text-gray-600">See what our customers are saying.</p>
            </div>
            <a href="#" className="text-primary font-semibold hover:underline hidden md:block">View all Google Reviews</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReviewCard 
              name="Sarah Jenkins" 
              date="2 days ago" 
              text="Excellent service! The shuttle was waiting when we arrived, and the drivers were so helpful with our heavy bags. Will definitely use again." 
            />
            <ReviewCard 
              name="David Thompson" 
              date="1 week ago" 
              text="Simple to find, very secure, and much cheaper than parking at the port. The EV charging add-on was a lifesaver for our drive home." 
            />
            <ReviewCard 
              name="Michael & Joan" 
              date="2 weeks ago" 
              text="First time using off-site parking and it was seamless. Very friendly staff. The car wash was a nice touch to come back to." 
            />
          </div>
        </div>
      </section>

      {/* Charities We Support */}
      <section className="bg-primary py-16 overflow-hidden">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Charities We Support</h2>
        <div className="relative flex">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
            .charity-marquee {
              display: flex;
              animation: marquee 20s linear infinite;
              width: max-content;
              pointer-events: none;
              user-select: none;
              will-change: transform;
            }
          `}</style>
          <div className="charity-marquee">
            {Array.from({ length: 3 }, () => [
              '/charities-logos/rnli.png',
              '/charities-logos/british-heart.png',
              '/charities-logos/seafarers.png',
              '/charities-logos/ocean-cleanup.png',
            ]).flat().map((src, i) => (
              <img key={i} src={src} alt="" className="h-36 w-auto mx-16 shrink-0 object-contain" />
            ))}
          </div>
        </div>
      </section>

       {/* Location / Call to Action */}
       <section className="bg-brand-dark text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to book your space?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Spaces fill up quickly during peak cruise season. Reserve your parking today for peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book">
               <Button variant="primary" className="w-full sm:w-auto px-10 text-lg">Book Now</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="w-full sm:w-auto border-white text-white hover:bg-white/10">Contact Us</Button>
            </Link>
          </div>
        </div>
       </section>
    </Layout>
  );
};