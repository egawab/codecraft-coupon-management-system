import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useParams, Link } from 'react-router-dom';
import { logger } from '../utils/logger';
import { api } from '../services/api';
import { logger } from '../utils/logger';
import { Coupon } from '../types';
import { logger } from '../utils/logger';
import CouponCard from '../components/CouponCard';
import { logger } from '../utils/logger';
import { 
  MapPinIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const LocationCouponsPage: React.FC = () => {
  const { country, city, area } = useParams<{ country?: string; city?: string; area?: string }>();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const allCoupons = await api.getAllCoupons();
        
        // Filter coupons based on location
        const filtered = allCoupons.filter(coupon => {
          // Global coupons are valid everywhere
          if (coupon.isGlobal) return true;
          
          // Check country
          if (country && coupon.countries && !coupon.countries.includes(country)) {
            return false;
          }
          
          // Check city
          if (city && coupon.cities && !coupon.cities.includes(city)) {
            return false;
          }
          
          // Check area
          if (area && coupon.areas && !coupon.areas.includes(area)) {
            return false;
          }
          
          return true;
        });
        
        setCoupons(filtered);
      } catch (error) {
        logger.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [country, city, area]);

  const filteredCoupons = coupons.filter(coupon =>
    coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'All Locations', path: '/locations' },
    ...(country ? [{ label: country, path: `/locations/${encodeURIComponent(country)}` }] : []),
    ...(city ? [{ label: city, path: `/locations/${encodeURIComponent(country!)}/${encodeURIComponent(city)}` }] : []),
    ...(area ? [{ label: area, path: `/locations/${encodeURIComponent(country!)}/${encodeURIComponent(city!)}/${encodeURIComponent(area)}` }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <Link
                to={crumb.path}
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="glass-panel p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPinIcon className="h-10 w-10 text-purple-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                {area || city || country || 'All Locations'}
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${filteredCoupons.length} deals available`}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals in this location..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading deals...</p>
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Deals Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'There are no deals available in this location yet'}
            </p>
            <Link to="/locations" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeftIcon className="h-5 w-5" />
              Browse Other Locations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCouponsPage;
