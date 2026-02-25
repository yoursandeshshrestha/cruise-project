import React from 'react';
import { Layout } from '../components/Layout';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

const REVIEWS_DATA = [
    {
        id: 1,
        name: 'Sarah Jenkins',
        date: '2 days ago',
        rating: 5,
        title: 'Excellent service!',
        text: 'The shuttle was waiting when we arrived, and the drivers were so helpful with our heavy bags. Will definitely use again for our next P&O cruise.'
    },
    {
        id: 2,
        name: 'David Thompson',
        date: '1 week ago',
        rating: 5,
        title: 'Great value for money',
        text: 'Simple to find, very secure, and much cheaper than parking at the port. The EV charging add-on was a lifesaver for our drive home.'
    },
    {
        id: 3,
        name: 'Michael & Joan',
        date: '2 weeks ago',
        rating: 4,
        title: 'Seamless experience',
        text: 'First time using off-site parking and it was seamless. Very friendly staff. The car wash was a nice touch to come back to. Only gave 4 stars because the sign at the entrance is a bit small.'
    },
    {
        id: 4,
        name: 'Peter W',
        date: '3 weeks ago',
        rating: 5,
        title: 'Highly Recommended',
        text: 'We usually park at the terminal but decided to save some money this time. Honestly, the service was just as good. The shuttle dropped us right at the door.'
    },
    {
        id: 5,
        name: 'Emma Louise',
        date: '1 month ago',
        rating: 5,
        title: 'Friendly Staff',
        text: 'The ladies at reception were lovely and the driver was hilarious. Started the holiday off with a smile.'
    }
];

export const Reviews: React.FC = () => {
  return (
    <Layout>
      <div className="bg-neutral-light py-16">
        <div className="max-w-7xl mx-auto px-4">
            
            {/* Header Stats */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-brand-dark mb-4">Customer Reviews</h1>
                <p className="text-lg text-gray-600 mb-8">See what thousands of happy cruisers have to say.</p>
                
                <div className="inline-flex items-center gap-8 bg-white px-8 py-4 rounded-full shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-dark">4.9</div>
                        <div className="flex text-yellow-400 text-sm">
                            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-dark">2.1k+</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Verified Reviews</div>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {REVIEWS_DATA.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-brand-dark">{review.title}</h3>
                                <div className="flex text-yellow-400 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 flex-grow">"{review.text}"</p>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                            <span className="text-sm font-bold text-brand-dark">{review.name}</span>
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                <ThumbsUp size={12} />
                                <span>Verified</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="bg-brand-dark rounded-2xl p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Join our happy customers</h2>
                <p className="text-gray-300 mb-8">Book your secure parking space today.</p>
                <Link to="/book">
                    <Button variant="primary" className="px-8">Get a Quote</Button>
                </Link>
            </div>

        </div>
      </div>
    </Layout>
  );
};