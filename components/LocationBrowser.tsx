import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  countryData, 
  getAllCountries, 
  getCitiesForCountry, 
  getDistrictsForCity 
} from '../utils/countryData';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'list' | 'map';

const LocationBrowser: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const countries = getAllCountries();

  // Filter countries, cities, and areas based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { 
      country: string; 
      cities: { 
        name: string; 
        areas: string[] 
      }[] 
    }[] = [];

    countries.forEach(country => {
      const countryMatch = country.toLowerCase().includes(query);
      const cities = getCitiesForCountry(country);
      const matchingCities: { name: string; areas: string[] }[] = [];

      cities.forEach(city => {
        const cityMatch = city.toLowerCase().includes(query);
        const areas = getDistrictsForCity(country, city);
        const matchingAreas = areas.filter(area => 
          area.toLowerCase().includes(query)
        );

        if (cityMatch || matchingAreas.length > 0 || countryMatch) {
          matchingCities.push({
            name: city,
            areas: matchingAreas.length > 0 ? matchingAreas : areas
          });
        }
      });

      if (countryMatch || matchingCities.length > 0) {
        results.push({
          country,
          cities: matchingCities
        });
      }
    });

    return results;
  }, [searchQuery, countries]);

  const toggleCountry = (country: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(country)) {
      newExpanded.delete(country);
    } else {
      newExpanded.add(country);
    }
    setExpandedCountries(newExpanded);
  };

  const toggleCity = (cityKey: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityKey)) {
      newExpanded.delete(cityKey);
    } else {
      newExpanded.add(cityKey);
    }
    setExpandedCities(newExpanded);
  };

  const getCouponCount = (country?: string, city?: string, area?: string) => {
    // This would be replaced with actual API call
    return Math.floor(Math.random() * 50) + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            🌍 Explore Locations Worldwide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse coupons and deals from all {countries.length} countries worldwide with millions of cities and areas
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for countries, cities, or areas..."
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all shadow-lg"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600 text-center">
              {filteredData?.length || 0} location(s) found
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-6 text-center hover:shadow-glow transition-all duration-300">
            <GlobeAltIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">{countries.length}+</div>
            <div className="text-gray-600">Countries</div>
          </div>
          <div className="glass-panel p-6 text-center hover:shadow-glow transition-all duration-300">
            <BuildingOfficeIcon className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">4M+</div>
            <div className="text-gray-600">Cities Worldwide</div>
          </div>
          <div className="glass-panel p-6 text-center hover:shadow-glow transition-all duration-300">
            <MapPinIcon className="h-12 w-12 text-pink-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">∞</div>
            <div className="text-gray-600">Local Districts</div>
          </div>
        </div>

        {/* Search Results or Full List */}
        <div className="max-w-7xl mx-auto">
          {searchQuery && filteredData ? (
            /* Search Results */
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
              {filteredData.map(countryData => (
                <div key={countryData.country} className="glass-panel p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                    {countryData.country}
                    <span className="text-sm font-normal text-gray-500">
                      ({countryData.cities.length} cities)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countryData.cities.map(city => (
                      <div key={city.name} className="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
                        <Link 
                          to={`/locations/${encodeURIComponent(countryData.country)}/${encodeURIComponent(city.name)}`}
                          className="font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-2 mb-2"
                        >
                          <BuildingOfficeIcon className="h-5 w-5" />
                          {city.name}
                        </Link>
                        <div className="text-sm text-gray-600 space-y-1">
                          {city.areas.slice(0, 3).map(area => (
                            <div key={area} className="flex items-center gap-2">
                              <ChevronRightIcon className="h-3 w-3" />
                              <Link 
                                to={`/locations/${encodeURIComponent(countryData.country)}/${encodeURIComponent(city.name)}/${encodeURIComponent(area)}`}
                                className="hover:text-purple-600"
                              >
                                {area}
                              </Link>
                            </div>
                          ))}
                          {city.areas.length > 3 && (
                            <div className="text-xs text-gray-500 mt-1">
                              +{city.areas.length - 3} more areas
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredData.length === 0 && (
                <div className="glass-panel p-12 text-center">
                  <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try searching with different keywords</p>
                </div>
              )}
            </div>
          ) : (
            /* Dropdown Country Selector */
            <div className="space-y-6">
              <div className="glass-panel p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse Locations by Country</h2>
                <p className="text-gray-600 text-center mb-6">Select a country from the dropdown to explore cities and local areas</p>
                
                {/* Country Dropdown */}
                <div className="max-w-2xl mx-auto mb-8">
                  <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Country
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                    <select
                      id="country-select"
                      value={selectedCountry || ''}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value || null);
                        setSelectedCity(null);
                      }}
                      className="w-full pl-14 pr-10 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all shadow-lg appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Choose a country...</option>
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Selected Country Details */}
                {selectedCountry && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-4">
                        <GlobeAltIcon className="h-10 w-10 text-blue-600" />
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{selectedCountry}</h3>
                          <p className="text-gray-600">{getCitiesForCountry(selectedCountry).length} cities available</p>
                        </div>
                      </div>
                      <Link
                        to={`/locations/${encodeURIComponent(selectedCountry)}`}
                        className="btn-primary"
                      >
                        View All Deals
                      </Link>
                    </div>

                    {/* Cities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getCitiesForCountry(selectedCountry).map(city => {
                        const cityKey = `${selectedCountry}-${city}`;
                        const isCityExpanded = expandedCities.has(cityKey);
                        const areas = getDistrictsForCity(selectedCountry, city);
                        
                        return (
                          <div key={city} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                            <button
                              onClick={() => toggleCity(cityKey)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isCityExpanded ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                )}
                                <BuildingOfficeIcon className="h-5 w-5 text-purple-500" />
                                <span className="font-semibold text-gray-800">{city}</span>
                              </div>
                              <Link
                                to={`/locations/${encodeURIComponent(selectedCountry)}/${encodeURIComponent(city)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                              >
                                View
                              </Link>
                            </button>
                            
                            {isCityExpanded && (
                              <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100">
                                <div className="space-y-1 mt-2">
                                  {areas.map(area => (
                                    <Link
                                      key={area}
                                      to={`/locations/${encodeURIComponent(selectedCountry)}/${encodeURIComponent(city)}/${encodeURIComponent(area)}`}
                                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 py-1 group"
                                    >
                                      <MapPinIcon className="h-4 w-4 text-pink-500 group-hover:text-purple-500" />
                                      <span>{area}</span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!selectedCountry && (
                  <div className="text-center py-12">
                    <GlobeAltIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Select a country to see available cities and areas</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationBrowser;
