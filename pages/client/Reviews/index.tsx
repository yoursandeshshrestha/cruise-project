import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { SEO, SITE_URL } from '../../../components/client/SEO';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '../../../components/client/Button';
import { Link } from 'react-router-dom';

const REVIEWS_DATA = [
    {
        id: 1,
        name: 'Linda & Barry H',
        date: '3 days ago',
        rating: 5,
        title: 'Stress-free from start to finish',
        text: 'Arrived nice and early and were on the shuttle within minutes. The staff were calm and organised and it really set the tone for the holiday. Brilliant service.'
    },
    {
        id: 2,
        name: 'James Corbett',
        date: '5 days ago',
        rating: 5,
        title: 'Much better than port parking',
        text: 'Saved a fortune compared to parking at the terminal and honestly had no idea it would be this easy. Clean facility, quick shuttle, and someone even helped me with my case.'
    },
    {
        id: 3,
        name: 'Tracey M',
        date: '1 week ago',
        rating: 5,
        title: 'Absolutely faultless',
        text: 'Booked last minute and it all went perfectly. The driver was friendly and had us at the terminal in no time. Car was exactly where we left it when we got back.'
    },
    {
        id: 4,
        name: 'Robert & Gill',
        date: '2 weeks ago',
        rating: 4,
        title: 'Really good value',
        text: 'Very impressed with the security and the speed of the shuttle. Only slight thing was a short wait on the way back, but the driver kept us updated and it wasn\'t long at all.'
    },
    {
        id: 5,
        name: 'Christine D',
        date: '3 weeks ago',
        rating: 5,
        title: 'Lovely team',
        text: 'The staff at the car park were so warm and welcoming. It\'s the small things that make a difference and they really went out of their way to help. Will definitely be back.'
    },
    {
        id: 6,
        name: 'Paul Whitmore',
        date: '1 month ago',
        rating: 5,
        title: 'Can\'t fault it',
        text: 'Booked for our Royal Caribbean cruise and everything worked like clockwork. Easy to find, great price, and the shuttle was ready and waiting. Highly recommend.'
    }
];

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Simple Cruise Parking',
  url: SITE_URL,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    ratingCount: '200',
    reviewCount: '200',
  },
  review: REVIEWS_DATA.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
    },
    name: r.title,
    reviewBody: r.text,
  })),
};

export const Reviews: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Customer Reviews | Simple Cruise Parking Southampton"
        description="Read genuine customer reviews of Simple Cruise Parking Southampton. See why hundreds of cruise passengers rate us 5 stars."
        canonicalPath="/reviews"
        schemaMarkup={reviewSchema}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Customer Reviews', path: '/reviews' },
        ]}
      />
      <div className="bg-neutral-light py-16">
        <div className="max-w-7xl mx-auto px-4">
            
            {/* Header Stats */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-brand-dark mb-4">Customer Reviews</h1>
                <p className="text-lg text-gray-600 mb-8">See what hundreds of happy cruisers have to say.</p>
                
                <div className="inline-flex items-center gap-8 bg-white px-8 py-4 rounded-full shadow-sm border border-gray-200">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-dark">4.9</div>
                        <div className="flex text-yellow-400 text-sm">
                            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-brand-dark">200+</div>
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