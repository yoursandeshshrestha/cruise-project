import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Users, Calendar, DollarSign, Car } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: any }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-light border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-dark mt-1">{value}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full text-primary">
            <Icon size={24} />
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    // Mock Data
    const bookings = [
        { id: 'SCP-1234', name: 'John Smith', ship: 'Iona', dropOff: '2023-10-15', status: 'Confirmed' },
        { id: 'SCP-5678', name: 'Sarah Jones', ship: 'Arvia', dropOff: '2023-10-15', status: 'Checked In' },
        { id: 'SCP-9012', name: 'Mike Brown', ship: 'Queen Mary 2', dropOff: '2023-10-16', status: 'Confirmed' },
        { id: 'SCP-3456', name: 'Emma Wilson', ship: 'Ventura', dropOff: '2023-10-16', status: 'Pending' },
    ];

    return (
        <Layout>
            <div className="bg-white border-b border-gray-200 py-6 mb-8">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-brand-dark">Admin Dashboard</h1>
                    <Button variant="secondary" className="py-2 text-sm">Export Data</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Today's Arrivals" value="45" icon={Car} />
                    <StatCard title="Today's Departures" value="32" icon={Car} />
                    <StatCard title="Active Bookings" value="1,240" icon={Calendar} />
                    <StatCard title="Revenue (Today)" value="£3,450" icon={DollarSign} />
                </div>

                <div className="bg-white rounded-xl shadow-light border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-brand-dark">Recent Bookings</h3>
                        <input 
                            type="text" 
                            placeholder="Search booking..." 
                            className="border rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Reference</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Ship</th>
                                    <th className="p-4">Arrival Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{b.id}</td>
                                        <td className="p-4">{b.name}</td>
                                        <td className="p-4">{b.ship}</td>
                                        <td className="p-4">{b.dropOff}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                                                b.status === 'Checked In' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-primary hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
