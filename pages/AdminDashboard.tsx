
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { Shop, AdminCreditLog, Coupon, Redemption, Referral, Role } from '../types';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import {
    UserGroupIcon,
    BanknotesIcon,
    GiftIcon,
    TicketIcon,
    TrashIcon,
    EyeIcon,
    Cog6ToothIcon,
    AdjustmentsHorizontalIcon,
    TableCellsIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';

type AdminTab =
    | 'overview'
    | 'shops'
    | 'affiliates'
    | 'coupons'
    | 'redemptions'
    | 'referrals'
    | 'intelligence'
    | 'settings';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [allUsers, setAllUsers] = useState<Shop[]>([]);
    const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
    const [creditLogs, setCreditLogs] = useState<AdminCreditLog[]>([]);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [selectedUser, setSelectedUser] = useState<Shop | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [creditsInput, setCreditsInput] = useState('');
    const [rolesInput, setRolesInput] = useState<Role[]>([]);
    const [savingUser, setSavingUser] = useState(false);
    const [busy, setBusy] = useState(false);
    const [affiliateDetailsOpen, setAffiliateDetailsOpen] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState<User | null>(null);
    const [systemActivity, setSystemActivity] = useState<any[]>([]);
    const [allCustomerData, setAllCustomerData] = useState<any[]>([]);
    const [intelligenceData, setIntelligenceData] = useState<any>({});

    const fetchData = useCallback(async () => {
        if (user?.roles.includes('admin')) {
            setBusy(true);
            try {
                const [fetchedUsers, fetchedCoupons, allCreditLogs, allRedemptions, allReferrals, activityData] = await Promise.all([
                api.getAllUsers(), 
                api.getAllCoupons(),
                    api.getAdminCreditLogs(),
                    api.getAllRedemptions(),
                    api.getAllReferrals(),
                    api.getSystemActivity()
            ]);
            setAllUsers(fetchedUsers);
            setAllCoupons(fetchedCoupons);
            setCreditLogs(allCreditLogs);
                setRedemptions(allRedemptions);
                setReferrals(allReferrals);
                setSystemActivity(activityData || []);
            } finally {
                setBusy(false);
            }
        }
    }, [user]);

    const fetchIntelligenceData = useCallback(async () => {
        if (user?.roles.includes('admin')) {
            setBusy(true);
            try {
                console.log('🔍 Fetching comprehensive intelligence data...');
                
                // Fetch all customer data from multiple sources
                const allShopIds = allUsers.filter(u => u.roles.includes('shop-owner')).map(u => u.id);
                const allAffiliateIds = allUsers.filter(u => u.roles.includes('affiliate')).map(u => u.id);
                
                const [shopCustomerData, affiliateCustomerData] = await Promise.all([
                    Promise.all(allShopIds.map(shopId => api.getCustomerDataForShop(shopId))),
                    Promise.all(allAffiliateIds.map(affiliateId => api.getCustomerDataForAffiliate(affiliateId)))
                ]);
                
                // Flatten and combine customer data
                const allCustomers = [
                    ...shopCustomerData.flat(),
                    ...affiliateCustomerData.flat()
                ];
                
                // Deduplicate customer data
                const uniqueCustomers = allCustomers.reduce((unique, customer) => {
                    const key = `${customer.couponId}-${customer.userId}`;
                    if (!unique.find(item => `${item.couponId}-${item.userId}` === key)) {
                        unique.push(customer);
                    }
                    return unique;
                }, [] as any[]);
                
                setAllCustomerData(uniqueCustomers);
                
                // Calculate intelligence insights
                const intelligence = calculateIntelligenceInsights(uniqueCustomers, allUsers, allCoupons, redemptions);
                setIntelligenceData(intelligence);
                
                console.log(`📊 Intelligence data compiled: ${uniqueCustomers.length} customers, ${Object.keys(intelligence).length} insights`);
                
            } catch (error) {
                console.error('❌ Error fetching intelligence data:', error);
            } finally {
                setBusy(false);
            }
        }
    }, [user, allUsers, allCoupons, redemptions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (activeTab === 'intelligence' && allUsers.length > 0) {
            fetchIntelligenceData();
        }
    }, [activeTab, allUsers.length, fetchIntelligenceData]);

    // Intelligence calculation function
    const calculateIntelligenceInsights = (customers: any[], users: any[], coupons: any[], redemptions: any[]) => {
        const shopOwners = users.filter(u => u.roles.includes('shop-owner'));
        const affiliates = users.filter(u => u.roles.includes('affiliate'));
        
        // Shop insights
        const shopInsights = shopOwners.map(shop => {
            const shopCoupons = coupons.filter(c => c.shopOwnerId === shop.id);
            const shopRedemptions = redemptions.filter(r => r.shopOwnerId === shop.id);
            const shopCustomers = customers.filter(c => c.shopOwnerId === shop.id);
            
            const affiliateRedemptions = shopRedemptions.filter(r => r.affiliateId);
            const directRedemptions = shopRedemptions.filter(r => !r.affiliateId);
            
            const uniqueAffiliates = [...new Set(affiliateRedemptions.map(r => r.affiliateId))];
            const totalCommissionsPaid = affiliateRedemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0);
            
            return {
                id: shop.id,
                name: shop.name,
                email: shop.email,
                credits: shop.credits,
                couponsCreated: shopCoupons.length,
                totalRedemptions: shopRedemptions.length,
                uniqueCustomers: [...new Set(shopCustomers.map(c => c.userId))].length,
                affiliateRedemptions: affiliateRedemptions.length,
                directRedemptions: directRedemptions.length,
                affiliatesWorkedWith: uniqueAffiliates.length,
                totalCommissionsPaid,
                avgRedemptionsPerCoupon: shopCoupons.length > 0 ? (shopRedemptions.length / shopCoupons.length).toFixed(2) : '0',
                conversionRate: shopCoupons.length > 0 ? ((shopRedemptions.length / shopCoupons.reduce((sum, c) => sum + c.clicks, 0)) * 100).toFixed(2) : '0',
                customerRetention: shopCustomers.filter(c => c.hasCompleteProfile).length,
                performanceScore: calculatePerformanceScore(shopRedemptions.length, shopCoupons.length, totalCommissionsPaid)
            };
        });

        // Affiliate insights  
        const affiliateInsights = affiliates.map(affiliate => {
            const affiliateRedemptions = redemptions.filter(r => r.affiliateId === affiliate.id);
            const affiliateCustomers = customers.filter(c => c.affiliateId === affiliate.id);
            const couponsPromoted = [...new Set(affiliateRedemptions.map(r => r.couponId))];
            const shopsWorkedWith = [...new Set(affiliateRedemptions.map(r => r.shopOwnerId))];
            const totalCommissionsEarned = affiliateRedemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0);
            
            return {
                id: affiliate.id,
                name: affiliate.name,
                email: affiliate.email,
                credits: affiliate.credits,
                couponsPromoted: couponsPromoted.length,
                totalConversions: affiliateRedemptions.length,
                uniqueCustomers: [...new Set(affiliateCustomers.map(c => c.userId))].length,
                shopsWorkedWith: shopsWorkedWith.length,
                totalCommissionsEarned,
                avgCommissionPerConversion: affiliateRedemptions.length > 0 ? (totalCommissionsEarned / affiliateRedemptions.length).toFixed(2) : '0',
                customerQuality: affiliateCustomers.filter(c => c.isVerifiedCustomer).length,
                networkValue: calculateNetworkValue(affiliateRedemptions.length, shopsWorkedWith.length, totalCommissionsEarned)
            };
        });

        // Customer analytics
        const customerAnalytics = {
            totalUniqueCustomers: [...new Set(customers.map(c => c.userId))].length,
            verifiedCustomers: customers.filter(c => c.isVerifiedCustomer).length,
            completeProfiles: customers.filter(c => c.hasCompleteProfile).length,
            avgRedemptionsPerCustomer: customers.length > 0 ? (customers.length / [...new Set(customers.map(c => c.userId))].length).toFixed(2) : '0',
            topCustomers: getTopCustomers(customers),
            customerJourney: analyzeCustomerJourney(customers),
            demographicBreakdown: analyzeDemographics(customers)
        };

        // Global analytics
        const globalAnalytics = {
            totalRevenue: redemptions.reduce((sum, r) => sum + (r.discountValue || 0), 0),
            totalCommissions: redemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
            networkEfficiency: redemptions.length > 0 ? ((redemptions.filter(r => r.affiliateId).length / redemptions.length) * 100).toFixed(2) : '0',
            topPerformingCoupons: getTopPerformingCoupons(coupons, redemptions),
            growthMetrics: calculateGrowthMetrics(redemptions, customers),
            systemHealth: calculateSystemHealth(shopInsights, affiliateInsights, customers)
        };

        return {
            shopInsights: shopInsights.sort((a, b) => b.performanceScore - a.performanceScore),
            affiliateInsights: affiliateInsights.sort((a, b) => b.networkValue - a.networkValue),
            customerAnalytics,
            globalAnalytics,
            lastUpdated: new Date().toISOString()
        };
    };

    // Helper functions for calculations
    const calculatePerformanceScore = (redemptions: number, coupons: number, commissions: number) => {
        return (redemptions * 10) + (coupons * 5) - (commissions * 0.1);
    };

    const calculateNetworkValue = (conversions: number, shops: number, commissions: number) => {
        return (conversions * 15) + (shops * 25) + (commissions * 0.2);
    };

    const getTopCustomers = (customers: any[]) => {
        const customerStats = customers.reduce((stats, customer) => {
            const userId = customer.userId;
            if (!stats[userId]) {
                stats[userId] = {
                    userId,
                    name: customer.customerName || 'Unknown',
                    email: customer.customerEmail,
                    redemptions: 0,
                    totalSavings: 0,
                    shopsVisited: new Set(),
                    affiliatesUsed: new Set()
                };
            }
            stats[userId].redemptions++;
            stats[userId].totalSavings += customer.discountValue || 0;
            stats[userId].shopsVisited.add(customer.shopOwnerId);
            if (customer.affiliateId) stats[userId].affiliatesUsed.add(customer.affiliateId);
            return stats;
        }, {} as any);

        return Object.values(customerStats)
            .map((customer: any) => ({
                ...customer,
                shopsVisited: customer.shopsVisited.size,
                affiliatesUsed: customer.affiliatesUsed.size
            }))
            .sort((a: any, b: any) => b.redemptions - a.redemptions)
            .slice(0, 10);
    };

    const analyzeCustomerJourney = (customers: any[]) => {
        const journeySteps = customers.reduce((steps, customer) => {
            const source = customer.affiliateId ? 'affiliate' : 'direct';
            if (!steps[source]) steps[source] = 0;
            steps[source]++;
            return steps;
        }, {} as any);

        return journeySteps;
    };

    const analyzeDemographics = (customers: any[]) => {
        const demographics = {
            ageGroups: {} as any,
            genderDistribution: {} as any,
            locationData: {} as any
        };

        customers.forEach(customer => {
            // Age analysis
            if (customer.customerAge) {
                const ageGroup = customer.customerAge < 25 ? '18-24' :
                                customer.customerAge < 35 ? '25-34' :
                                customer.customerAge < 45 ? '35-44' :
                                customer.customerAge < 55 ? '45-54' : '55+';
                demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;
            }

            // Gender analysis
            if (customer.customerGender) {
                demographics.genderDistribution[customer.customerGender] = 
                    (demographics.genderDistribution[customer.customerGender] || 0) + 1;
            }
        });

        return demographics;
    };

    const getTopPerformingCoupons = (coupons: any[], redemptions: any[]) => {
        return coupons
            .map(coupon => {
                const couponRedemptions = redemptions.filter(r => r.couponId === coupon.id);
                return {
                    ...coupon,
                    redemptionCount: couponRedemptions.length,
                    conversionRate: coupon.clicks > 0 ? ((couponRedemptions.length / coupon.clicks) * 100).toFixed(2) : '0',
                    totalCommissionsPaid: couponRedemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0)
                };
            })
            .sort((a, b) => b.redemptionCount - a.redemptionCount)
            .slice(0, 10);
    };

    const calculateGrowthMetrics = (redemptions: any[], customers: any[]) => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const thisMonthRedemptions = redemptions.filter(r => new Date(r.redeemedAt) > lastMonth).length;
        const thisWeekRedemptions = redemptions.filter(r => new Date(r.redeemedAt) > lastWeek).length;
        const thisMonthCustomers = customers.filter(c => new Date(c.redeemedAt) > lastMonth).length;

        return {
            monthlyRedemptions: thisMonthRedemptions,
            weeklyRedemptions: thisWeekRedemptions,
            monthlyNewCustomers: thisMonthCustomers,
            avgDailyRedemptions: (thisMonthRedemptions / 30).toFixed(1)
        };
    };

    const calculateSystemHealth = (shops: any[], affiliates: any[], customers: any[]) => {
        const activeShops = shops.filter(s => s.totalRedemptions > 0).length;
        const activeAffiliates = affiliates.filter(a => a.totalConversions > 0).length;
        const healthScore = ((activeShops / shops.length) + (activeAffiliates / affiliates.length)) * 50;

        return {
            healthScore: healthScore.toFixed(1),
            activeShopsPercent: ((activeShops / shops.length) * 100).toFixed(1),
            activeAffiliatesPercent: ((activeAffiliates / affiliates.length) * 100).toFixed(1),
            customerSatisfaction: ((customers.filter(c => c.isVerifiedCustomer).length / customers.length) * 100).toFixed(1)
        };
    };

    const shopOwners = useMemo(() => allUsers.filter((u) => u.roles.includes('shop-owner')), [allUsers]);
    const affiliates = useMemo(() => allUsers.filter((u) => u.roles.includes('affiliate')), [allUsers]);

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm(t('common.areYouSure') + ' ' + t('common.actionCannotBeUndone'))) {
            await api.deleteUser(userId);
            fetchData();
        }
    };

    const handleDeleteCoupon = async (couponId: string) => {
        if (window.confirm(t('common.areYouSure'))) {
            await api.deleteCoupon(couponId);
            fetchData();
        }
    };

    const openUserDrawer = (userToEdit: Shop) => {
        setSelectedUser(userToEdit);
        setCreditsInput(String(userToEdit.credits ?? 0));
        setRolesInput(userToEdit.roles);
        setDrawerOpen(true);
    };

    const viewAffiliateDetails = (affiliateId: string) => {
        const affiliate = affiliates.find(a => a.id === affiliateId);
        if (affiliate) {
            setSelectedAffiliate(affiliate);
            setAffiliateDetailsOpen(true);
        }
    };

    const handleRoleToggle = (role: Role) => {
        setRolesInput((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };

    const handleSaveUserDetails = async () => {
        if (!selectedUser) return;
        setSavingUser(true);
        try {
            const creditsNumber = Number(creditsInput);
            if (!Number.isFinite(creditsNumber) || creditsNumber < 0) {
                alert("Credits must be a valid positive number");
                return;
            }
            // Admin can assign any amount of credits (no limit)
            await Promise.all([
                api.updateUserCredits(selectedUser.id, creditsNumber),
                api.updateUserRoles(selectedUser.id, rolesInput)
            ]);
            
            // Log admin credit grant if credits increased
            if (creditsNumber > selectedUser.credits) {
                await api.logAdminCreditGrant(selectedUser.id, selectedUser.name, creditsNumber - selectedUser.credits, user?.email || 'admin');
            }
            
            setDrawerOpen(false);
            setSelectedUser(null);
            fetchData();
        } finally {
            setSavingUser(false);
        }
    };

    if (!user) return null;

    const totalCreditsDistributed = creditLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalRedemptions = redemptions.length;

    const tabButtonClass = (tab: AdminTab) =>
        `px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-slate-100'}`;

    const roles: Role[] = ['admin', 'shop-owner', 'affiliate', 'user'];

    const renderUserDrawer = () => {
        if (!drawerOpen || !selectedUser) return null;
        return (
            <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
                <div
                    className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{selectedUser.id}</p>
                            <h2 className="text-2xl font-bold text-dark-gray mt-1">{selectedUser.name}</h2>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>
                        <button
                            className="text-sm text-gray-500 hover:text-alert"
                            onClick={() => setDrawerOpen(false)}
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Credits</label>
                            <input
                                type="number"
                                min="0"
                                value={creditsInput}
                                onChange={(e) => setCreditsInput(e.target.value)}
                                className="mt-1 w-full form-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ✨ Admin privilege: You can assign any amount of credits without limits
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Roles</p>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((role) => (
                                    <label key={role} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={rolesInput.includes(role)}
                                            onChange={() => handleRoleToggle(role)}
                                        />
                                        {t(`roles.${role}`)}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveUserDetails}
                                disabled={savingUser}
                                className="flex-1 btn-primary text-center"
                            >
                                {savingUser ? t('loginPage.processing') : t('profilePage.updateButton')}
                            </button>
                            <button
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="btn-secondary dark text-alert border-alert/40"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTable = (
        title: string,
        headers: string[],
        rows: React.ReactNode,
        actions?: React.ReactNode
    ) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark-gray">{title}</h3>
                {actions}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs uppercase bg-slate-50 text-gray-500">
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="px-4 py-3 whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">{rows}</tbody>
                </table>
            </div>
            {React.Children.count(rows) === 0 && (
                <p className="text-center text-gray-400 py-6 text-sm">No data available.</p>
            )}
        </div>
    );

    const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <TableCellsIcon className="h-4 w-4" /> },
        { id: 'shops', label: 'Shop Owners', icon: <UserGroupIcon className="h-4 w-4" /> },
        { id: 'affiliates', label: 'Affiliates', icon: <AdjustmentsHorizontalIcon className="h-4 w-4" /> },
        { id: 'coupons', label: 'Coupons', icon: <TicketIcon className="h-4 w-4" /> },
        { id: 'redemptions', label: 'Redemptions', icon: <BanknotesIcon className="h-4 w-4" /> },
        { id: 'referrals', label: 'Referrals', icon: <GiftIcon className="h-4 w-4" /> },
        { id: 'intelligence', label: 'Data Intelligence Center', icon: <TableCellsIcon className="h-4 w-4" /> },
        { id: 'settings', label: 'System Settings', icon: <Cog6ToothIcon className="h-4 w-4" /> }
    ];

    const overviewContent = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('admin.stats.totalUsers')}
                    value={allUsers.length}
                    icon={<UserGroupIcon className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title={t('admin.stats.totalCoupons')}
                    value={allCoupons.length}
                    icon={<TicketIcon className="h-6 w-6" />}
                    color="indigo"
                />
                <StatCard
                    title={t('admin.stats.creditsDistributed')}
                    value={totalCreditsDistributed.toLocaleString()}
                    icon={<BanknotesIcon className="h-6 w-6" />}
                    color="green"
                />
                <StatCard
                    title="Total Redemptions"
                    value={totalRedemptions}
                    icon={<GiftIcon className="h-6 w-6" />}
                    color="yellow"
                />
            </div>

            {renderTable(
                t('admin.tables.creditLog.title'),
                [t('admin.tables.creditLog.date'), t('admin.tables.creditLog.shopName'), t('admin.tables.creditLog.type'), t('admin.tables.creditLog.amount')],
                creditLogs.slice(0, 10).map((item) => (
                    <tr key={item.id} className="bg-white">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : '---'}
                        </td>
                        <td className="px-4 py-3 font-medium text-dark-gray">{item.shopName}</td>
                        <td className="px-4 py-3">
                            <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.type === 'Referrer Bonus'
                                        ? 'bg-green-100 text-success'
                                        : item.type === 'Referred Signup'
                                            ? 'bg-blue-100 text-primary'
                                            : item.type === 'Affiliate Commission'
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-gray-100'
                                }`}
                            >
                                {t(`creditLogTypes.${item.type.replace(/\s/g, '')}`)}
                            </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-success">+{item.amount.toLocaleString()}</td>
                    </tr>
                )),
                <button className="text-sm text-primary flex items-center gap-2" onClick={() => setActiveTab('redemptions')}>
                    View more <EyeIcon className="h-4 w-4" />
                </button>
            )}
        </>
    );

    const shopsContent = renderTable(
        'Shop Owners',
        ['Name', 'Email', 'City', 'Credits', 'Roles', 'Actions'],
        shopOwners.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-dark-gray">{item.name}</td>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.city || '--'}</td>
                <td className="px-4 py-3 font-semibold">{item.credits.toLocaleString()}</td>
                <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                        {item.roles.map((role) => (
                            <span key={role} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                    {t(`roles.${role}`)}
                                </span>
                            ))}
                        </div>
                    </td>
                <td className="px-4 py-3 flex gap-2">
                    <button
                        onClick={() => openUserDrawer(item)}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        Manage
                    </button>
                    <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="text-alert hover:text-red-700"
                        title="Remove user"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </td>
            </tr>
        ))
    );

    // Enhanced affiliate analytics
    const getAffiliateAnalytics = (affiliateId: string) => {
        const affiliateRedemptions = redemptions.filter(r => r.affiliateId === affiliateId);
        const affiliateCoupons = coupons.filter(c => c.affiliateId === affiliateId);
        const totalCommissions = affiliateRedemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0);
        const totalTraffic = affiliateRedemptions.length + (affiliateCoupons.length * 10); // Estimated traffic
        const conversionRate = affiliateRedemptions.length > 0 ? (affiliateRedemptions.length / totalTraffic * 100).toFixed(2) : '0.00';
        
        return {
            redemptions: affiliateRedemptions.length,
            couponsPromoted: new Set(affiliateRedemptions.map(r => r.couponId)).size,
            totalCommissions,
            conversionRate,
            totalTraffic,
            avgCommissionPerRedemption: affiliateRedemptions.length > 0 ? (totalCommissions / affiliateRedemptions.length).toFixed(2) : '0.00'
        };
    };

    const affiliatesContent = renderTable(
        'Affiliates - Complete Performance Overview',
        ['Affiliate', 'Contact', 'Performance Metrics', 'Traffic & Conversions', 'Commission Data', 'Actions'],
        affiliates.map((item) => {
            const analytics = getAffiliateAnalytics(item.id);
            
            return (
                <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                        <div className="flex flex-col">
                            <span className="font-medium text-dark-gray">{item.name}</span>
                            <span className="text-xs text-gray-500">ID: {item.id.slice(0, 8)}</span>
                            <span className="text-xs font-medium text-blue-600">{item.credits.toLocaleString()} credits</span>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="text-sm">
                            <div>{item.email}</div>
                            <div className="text-xs text-gray-500">Joined: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="space-y-1 text-sm">
                            <div><span className="font-medium text-blue-600">{analytics.couponsPromoted}</span> coupons promoted</div>
                            <div><span className="font-medium text-green-600">{analytics.redemptions}</span> conversions</div>
                            <div><span className="font-medium text-orange-600">{analytics.conversionRate}%</span> conv. rate</div>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="space-y-1 text-sm">
                            <div>Traffic: <span className="font-medium">{analytics.totalTraffic}</span></div>
                            <div>Clicks: <span className="text-purple-600 font-medium">~{analytics.totalTraffic}</span></div>
                            <div>Redemptions: <span className="text-green-600 font-medium">{analytics.redemptions}</span></div>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="space-y-1 text-sm">
                            <div className="font-semibold text-purple-600">{analytics.totalCommissions.toLocaleString()} total</div>
                            <div>Avg: {analytics.avgCommissionPerRedemption}</div>
                            <div className="text-xs text-gray-500">per conversion</div>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="space-y-2">
                            <button
                                onClick={() => openUserDrawer(item)}
                                className="block w-full text-xs bg-primary text-white px-2 py-1 rounded hover:opacity-90"
                            >
                                Manage
                            </button>
                            <button
                                onClick={() => viewAffiliateDetails(item.id)}
                                className="block w-full text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            >
                                Full Report
                            </button>
                        </div>
                    </td>
                </tr>
            );
        })
    );

    const couponsContent = renderTable(
        t('admin.tables.allCoupons.title'),
        ['Title', 'Shop Owner', 'Uses Left', 'Commission', 'Actions'],
        allCoupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{coupon.title}</td>
                <td className="px-4 py-3">{coupon.shopOwnerName}</td>
                <td className="px-4 py-3">{coupon.usesLeft} / {coupon.maxUses}</td>
                <td className="px-4 py-3">{coupon.affiliateCommission}</td>
                <td className="px-4 py-3">
                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-alert hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                        </button>
                    </td>
                </tr>
        ))
    );

    const redemptionsContent = (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">🎫 Complete Redemption Chain Analysis</h2>
                    <p className="text-gray-600">Full visibility into every redemption: Shop Owner → Affiliate → Customer with complete details</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Date & Time</th>
                                <th className="px-6 py-3 text-left">Complete Chain</th>
                                <th className="px-6 py-3 text-left">Coupon Details</th>
                                <th className="px-6 py-3 text-left">Customer Information</th>
                                <th className="px-6 py-3 text-left">Financial Flow</th>
                                <th className="px-6 py-3 text-left">System Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {redemptions.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {record.redeemedAt ? new Date(record.redeemedAt).toLocaleDateString() : '--'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {record.redeemedAt ? new Date(record.redeemedAt).toLocaleTimeString() : '--'}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            ID: {record.id?.slice(0, 8)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
                                                <span className="text-sm font-medium text-gray-800">🏪 {record.shopOwnerName || 'Unknown Shop'}</span>
                                            </div>
                                            <div className="ml-5 border-l-2 border-gray-200 pl-3">
                                                {record.affiliateId ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                            <span className="text-sm font-medium text-blue-700">📈 {record.affiliateName || 'Affiliate Partner'}</span>
                                                        </div>
                                                        <div className="ml-5 border-l-2 border-gray-200 pl-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                                                                <span className="text-sm font-medium text-orange-700">👤 {record.customerName || 'Customer'}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></span>
                                                        <span className="text-sm font-medium text-orange-700">👤 {record.customerName || 'Direct Customer'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    record.affiliateId ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {record.affiliateId ? 'Via Affiliate Network' : 'Direct Customer'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">{record.couponTitle || 'Unknown Coupon'}</div>
                                            <div className="text-xs text-gray-500">Coupon ID: {record.couponId?.slice(0, 8)}</div>
                                            <div className="text-xs text-blue-600">
                                                {record.discountType === 'percentage' ? `${record.discountValue}% OFF` : `$${record.discountValue} OFF`}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Shop: {record.shopOwnerName || 'Unknown'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {record.customerName ? (
                                                <div className="text-sm font-medium text-gray-900">{record.customerName}</div>
                                            ) : (
                                                <div className="text-sm font-medium text-red-600">⚠️ Customer name missing</div>
                                            )}
                                            
                                            {record.customerPhone ? (
                                                <div className="text-xs text-gray-700">📞 {record.customerPhone}</div>
                                            ) : (
                                                <div className="text-xs text-red-600">📞 Phone number required but missing</div>
                                            )}
                                            
                                            {record.customerEmail ? (
                                                <div className="text-xs text-gray-700">✉️ {record.customerEmail}</div>
                                            ) : (
                                                <div className="text-xs text-orange-600">✉️ Email not provided</div>
                                            )}
                                            
                                            {record.customerAddress && (
                                                <div className="text-xs text-gray-600">📍 {record.customerAddress}</div>
                                            )}
                                            
                                            {record.customerAge && (
                                                <div className="text-xs text-gray-600">
                                                    👤 {record.customerAge}y{record.customerGender ? `, ${record.customerGender}` : ''}
                                                </div>
                                            )}
                                            
                                            <div className="text-xs text-blue-600">
                                                Customer ID: {record.userId?.slice(0, 8) || record.customerId?.slice(0, 8) || 'Missing ID'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-green-600">
                                                💰 Commission: {record.commissionEarned ? `${record.commissionEarned} credits` : 'None'}
                                            </div>
                                            <div className="text-xs text-blue-600">
                                                🎁 Customer Points: {record.customerRewardPoints || 0}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                💳 Shop Revenue: {record.affiliateId ? `Less ${record.commissionEarned || 0} commission` : 'Full retention'}
                                            </div>
                                            <div className="text-xs text-purple-600">
                                                📊 Net Cost: {record.affiliateId ? `${record.commissionEarned || 0} credits` : 'Free acquisition'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-600">
                                                🎯 Acquisition: {record.affiliateId ? 'Affiliate-driven' : 'Organic'}
                                            </div>
                                            <div className="text-xs text-blue-600">
                                                📈 Network Value: {record.affiliateId ? 'High' : 'Direct'}
                                            </div>
                                            <div className="text-xs text-green-600">
                                                ✅ Status: Completed
                                            </div>
                                            <div className="text-xs text-purple-600">
                                                🔗 Chain Length: {record.affiliateId ? '3 parties' : '2 parties'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {redemptions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No redemptions yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const referralsContent = renderTable(
        'Referrals',
        ['Referrer', 'Referred Shop', 'Status', 'Signup Date'],
        referrals.map((referral) => (
            <tr key={referral.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{referral.referrerId}</td>
                <td className="px-4 py-3 font-medium text-dark-gray">{referral.referredShopName}</td>
                <td className="px-4 py-3">
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${
                            referral.status === 'rewarded' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-pending'
                        }`}
                    >
                        {t(`referralStatus.${referral.status}`)}
                    </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                    {referral.signupDate ? new Date(referral.signupDate).toLocaleString() : '--'}
                </td>
            </tr>
        ))
    );

    // NEW: Data Intelligence Center Content
    const intelligenceContent = (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">🧠 Data Intelligence Center</h1>
                        <p className="text-purple-100">Complete system-wide analytics and insights dashboard</p>
                        <p className="text-sm text-blue-200 mt-1">
                            Last updated: {intelligenceData.lastUpdated ? new Date(intelligenceData.lastUpdated).toLocaleString() : 'Not loaded'}
                        </p>
                    </div>
                    <div className="text-right">
                        <button
                            onClick={fetchIntelligenceData}
                            disabled={busy}
                            className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all font-medium"
                        >
                            {busy ? '🔄 Loading...' : '🔄 Refresh Data'}
                        </button>
                    </div>
                </div>
            </div>

            {busy && (
                <div className="text-center py-12">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="mt-4 text-gray-600">Loading comprehensive intelligence data...</p>
                </div>
            )}

            {!busy && intelligenceData.globalAnalytics && (
                <>
                    {/* Global System Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total System Health</p>
                                    <p className="text-3xl font-bold">{intelligenceData.globalAnalytics.systemHealth.healthScore}%</p>
                                </div>
                                <div className="text-blue-200">💚</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Network Efficiency</p>
                                    <p className="text-3xl font-bold">{intelligenceData.globalAnalytics.networkEfficiency}%</p>
                                </div>
                                <div className="text-green-200">📈</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Total Revenue Impact</p>
                                    <p className="text-3xl font-bold">${intelligenceData.globalAnalytics.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="text-purple-200">💰</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">Unique Customers</p>
                                    <p className="text-3xl font-bold">{intelligenceData.customerAnalytics.totalUniqueCustomers.toLocaleString()}</p>
                                </div>
                                <div className="text-orange-200">👥</div>
                            </div>
                        </div>
                    </div>

                    {/* Shop Insights Section */}
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">🏪 Complete Shop Insights</h2>
                            <p className="text-gray-600">Comprehensive analysis of all shop owner performance and customer acquisition</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Shop Details</th>
                                        <th className="px-6 py-3 text-left">Coupon Performance</th>
                                        <th className="px-6 py-3 text-left">Customer Analytics</th>
                                        <th className="px-6 py-3 text-left">Affiliate Network</th>
                                        <th className="px-6 py-3 text-left">Financial Impact</th>
                                        <th className="px-6 py-3 text-left">Performance Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {intelligenceData.shopInsights.slice(0, 20).map((shop: any) => (
                                        <tr key={shop.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">{shop.name}</div>
                                                    <div className="text-xs text-gray-500">{shop.email}</div>
                                                    <div className="text-xs text-blue-600">{shop.credits.toLocaleString()} credits</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">📊 {shop.couponsCreated} coupons created</div>
                                                    <div className="text-sm">🎯 {shop.totalRedemptions} total redemptions</div>
                                                    <div className="text-xs text-gray-600">Avg: {shop.avgRedemptionsPerCoupon} per coupon</div>
                                                    <div className="text-xs text-green-600">Conv: {shop.conversionRate}%</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">👥 {shop.uniqueCustomers} unique customers</div>
                                                    <div className="text-xs text-blue-600">📈 {shop.directRedemptions} direct</div>
                                                    <div className="text-xs text-purple-600">🤝 {shop.affiliateRedemptions} via affiliates</div>
                                                    <div className="text-xs text-green-600">🔒 {shop.customerRetention} retained</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">🤝 {shop.affiliatesWorkedWith} affiliates</div>
                                                    <div className="text-xs text-green-600">💰 {shop.totalCommissionsPaid.toLocaleString()} paid out</div>
                                                    <div className="text-xs text-gray-600">Network strength: {shop.affiliatesWorkedWith > 0 ? 'Strong' : 'Direct only'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-green-600">Revenue positive</div>
                                                    <div className="text-xs text-gray-600">Cost: {shop.totalCommissionsPaid} credits</div>
                                                    <div className="text-xs text-blue-600">ROI: Positive</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-purple-600">{shop.performanceScore.toFixed(0)}</div>
                                                    <div className="text-xs text-gray-500">Performance Index</div>
                                                    <div className={`text-xs ${shop.performanceScore > 50 ? 'text-green-600' : shop.performanceScore > 20 ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {shop.performanceScore > 50 ? '🟢 Excellent' : shop.performanceScore > 20 ? '🟡 Good' : '🔴 Needs attention'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Affiliate Insights Section */}
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">📈 Complete Affiliate Insights</h2>
                            <p className="text-gray-600">Comprehensive analysis of affiliate performance and customer acquisition</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Affiliate Details</th>
                                        <th className="px-6 py-3 text-left">Promotion Activity</th>
                                        <th className="px-6 py-3 text-left">Customer Quality</th>
                                        <th className="px-6 py-3 text-left">Network Reach</th>
                                        <th className="px-6 py-3 text-left">Earnings & Performance</th>
                                        <th className="px-6 py-3 text-left">Network Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {intelligenceData.affiliateInsights.slice(0, 20).map((affiliate: any) => (
                                        <tr key={affiliate.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">{affiliate.name}</div>
                                                    <div className="text-xs text-gray-500">{affiliate.email}</div>
                                                    <div className="text-xs text-blue-600">{affiliate.credits.toLocaleString()} credits</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">🎫 {affiliate.couponsPromoted} coupons promoted</div>
                                                    <div className="text-sm">✅ {affiliate.totalConversions} conversions</div>
                                                    <div className="text-xs text-gray-600">Success rate: {affiliate.totalConversions > 0 ? 'Active' : 'Inactive'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">👥 {affiliate.uniqueCustomers} customers acquired</div>
                                                    <div className="text-xs text-green-600">✅ {affiliate.customerQuality} verified</div>
                                                    <div className="text-xs text-blue-600">Quality score: {affiliate.customerQuality > 0 ? 'High' : 'Standard'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm">🏪 {affiliate.shopsWorkedWith} shops partnered</div>
                                                    <div className="text-xs text-purple-600">Network reach: {affiliate.shopsWorkedWith > 3 ? 'Wide' : affiliate.shopsWorkedWith > 1 ? 'Medium' : 'Limited'}</div>
                                                    <div className="text-xs text-gray-600">Partnership diversity</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-green-600">💰 {affiliate.totalCommissionsEarned.toLocaleString()} earned</div>
                                                    <div className="text-xs text-gray-600">Avg: {affiliate.avgCommissionPerConversion} per conversion</div>
                                                    <div className="text-xs text-blue-600">Efficiency: {affiliate.totalConversions > 0 ? 'Profitable' : 'Building'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-bold text-indigo-600">{affiliate.networkValue.toFixed(0)}</div>
                                                    <div className="text-xs text-gray-500">Network Value Index</div>
                                                    <div className={`text-xs ${affiliate.networkValue > 100 ? 'text-green-600' : affiliate.networkValue > 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {affiliate.networkValue > 100 ? '🟢 High value' : affiliate.networkValue > 50 ? '🟡 Growing' : '🔴 Developing'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Customer Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">👥 Customer Analytics</h3>
                                <p className="text-gray-600">Complete customer behavior and demographic analysis</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{intelligenceData.customerAnalytics.totalUniqueCustomers}</div>
                                        <div className="text-sm text-blue-800">Total Unique Customers</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{intelligenceData.customerAnalytics.verifiedCustomers}</div>
                                        <div className="text-sm text-green-800">Verified Customers</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{intelligenceData.customerAnalytics.completeProfiles}</div>
                                        <div className="text-sm text-purple-800">Complete Profiles</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">{intelligenceData.customerAnalytics.avgRedemptionsPerCustomer}</div>
                                        <div className="text-sm text-orange-800">Avg Redemptions/Customer</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Customer Journey Analysis</h4>
                                    <div className="space-y-2">
                                        {Object.entries(intelligenceData.customerAnalytics.customerJourney || {}).map(([source, count]) => (
                                            <div key={source} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="capitalize">{source} Customers</span>
                                                <span className="font-medium">{count as number}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 Top Performing Coupons</h3>
                                <p className="text-gray-600">Highest converting coupons across all shops</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {intelligenceData.globalAnalytics.topPerformingCoupons.slice(0, 8).map((coupon: any, index: number) => (
                                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{coupon.title}</div>
                                                    <div className="text-xs text-gray-500">by {coupon.shopOwnerName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-green-600">{coupon.redemptionCount} redemptions</div>
                                                <div className="text-xs text-blue-600">{coupon.conversionRate}% conv. rate</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Growth Metrics */}
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">📈 Growth & Performance Metrics</h3>
                            <p className="text-gray-600">Real-time system growth and health indicators</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">{intelligenceData.globalAnalytics.growthMetrics.monthlyRedemptions}</div>
                                    <div className="text-sm text-gray-600">This Month's Redemptions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">{intelligenceData.globalAnalytics.growthMetrics.weeklyRedemptions}</div>
                                    <div className="text-sm text-gray-600">This Week's Redemptions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">{intelligenceData.globalAnalytics.growthMetrics.monthlyNewCustomers}</div>
                                    <div className="text-sm text-gray-600">New Customers This Month</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">{intelligenceData.globalAnalytics.growthMetrics.avgDailyRedemptions}</div>
                                    <div className="text-sm text-gray-600">Avg Daily Redemptions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!busy && !intelligenceData.globalAnalytics && (
                <div className="bg-white rounded-xl shadow-lg border p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Intelligence Data Available</h3>
                    <p className="text-gray-600 mb-4">Click "Refresh Data" to load comprehensive analytics</p>
                    <button
                        onClick={fetchIntelligenceData}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
                    >
                        🔄 Load Intelligence Data
                    </button>
                </div>
            )}
        </div>
    );

    const settingsContent = (
        <div className="space-y-6">
            {/* NEW: Complete System Chain Analysis */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">🔗 Complete Activity Chain Analysis</h3>
                <p className="text-sm text-gray-500 mb-4">Full visibility: Shop Owner → Affiliate → User relationships and all system data</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chain Analysis */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">📊 Activity Chains</h4>
                        {redemptions.slice(0, 10).map((redemption) => (
                            <div key={redemption.id} className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {new Date(redemption.redeemedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="font-medium">🏪 Shop:</span>
                                        <span>{redemption.shopOwnerName || 'Unknown'}</span>
                                    </div>
                                    {redemption.affiliateId && (
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            <span className="font-medium">📈 Affiliate:</span>
                                            <span>{redemption.affiliateName || 'Unknown'}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 ml-8">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span className="font-medium">👤 Customer:</span>
                                        <span>{redemption.customerName || 'Unknown'}</span>
                                    </div>
                                    <div className="ml-12 text-xs text-gray-600">
                                        🎫 {redemption.couponTitle} • 💰 Commission: {redemption.commissionEarned || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed System Stats */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">📈 System Performance</h4>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-800 mb-2">🏪 Shop Owners</h5>
                            <div className="space-y-1 text-sm text-gray-700">
                                <div>Total Active: {shopOwners.length}</div>
                                <div>Avg Credits: {shopOwners.length > 0 ? Math.round(shopOwners.reduce((sum, s) => sum + s.credits, 0) / shopOwners.length).toLocaleString() : 0}</div>
                                <div>Total Coupons Created: {allCoupons.length}</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <h5 className="font-medium text-green-800 mb-2">📈 Affiliates</h5>
                            <div className="space-y-1 text-sm text-gray-700">
                                <div>Total Active: {affiliates.length}</div>
                                <div>Total Commissions Paid: {redemptions.reduce((sum, r) => sum + (r.commissionEarned || 0), 0).toLocaleString()}</div>
                                <div>Avg Performance: {affiliates.length > 0 ? (redemptions.filter(r => r.affiliateId).length / affiliates.length).toFixed(1) : 0} redemptions/affiliate</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <h5 className="font-medium text-purple-800 mb-2">👥 Customers</h5>
                            <div className="space-y-1 text-sm text-gray-700">
                                <div>Unique Customers: {new Set(redemptions.map(r => r.userId)).size}</div>
                                <div>Total Redemptions: {redemptions.length}</div>
                                <div>Avg Redemptions/Customer: {redemptions.length > 0 ? (redemptions.length / new Set(redemptions.map(r => r.userId)).size).toFixed(1) : 0}</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                            <h5 className="font-medium text-orange-800 mb-2">🔗 Network Effects</h5>
                            <div className="space-y-1 text-sm text-gray-700">
                                <div>Direct Redemptions: {redemptions.filter(r => !r.affiliateId).length}</div>
                                <div>Affiliate-driven: {redemptions.filter(r => r.affiliateId).length}</div>
                                <div>Network Efficiency: {redemptions.length > 0 ? ((redemptions.filter(r => r.affiliateId).length / redemptions.length) * 100).toFixed(1) : 0}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">🔍 Real-Time System Activity</h3>
                <p className="text-sm text-gray-500 mb-4">Monitor all account actions and system events</p>
                
                <div className="max-h-96 overflow-y-auto space-y-3">
                    {systemActivity.slice(0, 20).map((activity, index) => (
                        <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                activity.type === 'CUSTOMER_REDEMPTION' ? 'bg-green-500' :
                                activity.type === 'Admin Grant' ? 'bg-blue-500' :
                                activity.source === 'adminNotifications' ? 'bg-orange-500' :
                                'bg-gray-500'
                            }`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800">
                                        {activity.title || activity.type || 'System Action'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {activity.timestamp ? 
                                            new Date(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp).toLocaleString() : 
                                            'Just now'
                                        }
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {activity.message || activity.details || `Action from ${activity.source}`}
                                </p>
                                {activity.customerData && (
                                    <div className="text-xs text-blue-600 mt-1">
                                        👤 {activity.customerData.name} | 📞 {activity.customerData.phone}
                                    </div>
                                )}

                                {/* Affiliate Details Modal */}
                                {affiliateDetailsOpen && selectedAffiliate && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-bold text-gray-800">
                                                    📊 {selectedAffiliate.name} - Complete Performance Report
                                                </h2>
                                                <button
                                                    onClick={() => setAffiliateDetailsOpen(false)}
                                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Affiliate Overview */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                        <h3 className="font-semibold text-blue-800">Contact Info</h3>
                                                        <div className="text-sm text-gray-600 space-y-1 mt-2">
                                                            <p><strong>Email:</strong> {selectedAffiliate.email}</p>
                                                            <p><strong>ID:</strong> {selectedAffiliate.id}</p>
                                                            <p><strong>Credits:</strong> {selectedAffiliate.credits}</p>
                                                            <p><strong>Joined:</strong> {new Date(selectedAffiliate.createdAt || Date.now()).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    {(() => {
                                                        const analytics = getAffiliateAnalytics(selectedAffiliate.id);
                                                        return (
                                                            <>
                                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                                    <h3 className="font-semibold text-green-800">Performance</h3>
                                                                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                                                                        <p><strong>Coupons Promoted:</strong> {analytics.couponsPromoted}</p>
                                                                        <p><strong>Total Conversions:</strong> {analytics.redemptions}</p>
                                                                        <p><strong>Conversion Rate:</strong> {analytics.conversionRate}%</p>
                                                                        <p><strong>Est. Traffic:</strong> {analytics.totalTraffic}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                                                    <h3 className="font-semibold text-purple-800">Earnings</h3>
                                                                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                                                                        <p><strong>Total Commissions:</strong> {analytics.totalCommissions}</p>
                                                                        <p><strong>Avg per Conversion:</strong> {analytics.avgCommissionPerRedemption}</p>
                                                                        <p><strong>Revenue Generated:</strong> ~{(analytics.totalCommissions * 5).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Recent Activity */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 mb-4">🔍 Recent Activity</h3>
                                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                                        {systemActivity
                                                            .filter(activity => activity.affiliateId === selectedAffiliate.id || activity.message?.includes(selectedAffiliate.name))
                                                            .slice(0, 10)
                                                            .map((activity, index) => (
                                                                <div key={index} className="bg-gray-50 p-3 rounded border text-sm">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-medium">{activity.type || 'Activity'}</span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'Recent'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-600">{activity.message || activity.details || 'System action'}</p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>

                                                {/* Promoted Coupons */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 mb-4">🎟️ Promoted Coupons</h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left">Coupon</th>
                                                                    <th className="px-4 py-2 text-left">Shop</th>
                                                                    <th className="px-4 py-2 text-left">Redemptions</th>
                                                                    <th className="px-4 py-2 text-left">Commission</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {redemptions
                                                                    .filter(r => r.affiliateId === selectedAffiliate.id)
                                                                    .slice(0, 10)
                                                                    .map((redemption, index) => (
                                                                        <tr key={index}>
                                                                            <td className="px-4 py-2">{redemption.couponTitle || 'Unknown'}</td>
                                                                            <td className="px-4 py-2">{redemption.shopOwnerName || 'Unknown'}</td>
                                                                            <td className="px-4 py-2">1</td>
                                                                            <td className="px-4 py-2">{redemption.commissionEarned || 0}</td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {systemActivity.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No recent activity</p>
                    )}
                </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-4">⚙️ System Settings</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Core automations (affiliate & referral payouts) are currently running via client-side logic.
                    Upgrade Firebase to Blaze plan to unlock secure Cloud Functions for production-grade automation.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Visit Firebase Console &gt; Billing → upgrade to Blaze.</li>
                    <li>Deploy backend functions: <code>firebase deploy --only functions</code>.</li>
                    <li>Revisit this panel to manage live payouts and advanced automation.</li>
                </ol>
            </div>
        </div>
    );

    const tabContentMap: Record<AdminTab, React.ReactNode> = {
        overview: overviewContent,
        shops: shopsContent,
        affiliates: affiliatesContent,
        coupons: couponsContent,
        redemptions: redemptionsContent,
        referrals: referralsContent,
        settings: settingsContent
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400">Control Center</p>
                    <h1 className="text-3xl font-bold text-dark-gray">{t('admin.dashboardTitle')}</h1>
                </div>
                <button
                    onClick={fetchData}
                    className="btn-secondary dark flex items-center gap-2 text-sm"
                    disabled={busy}
                >
                    <ArrowPathIcon className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                    Refresh data
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={tabButtonClass(tab.id)}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="inline-flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                    </button>
            ))}
            </div>

            <div className="space-y-8">{tabContentMap[activeTab]}</div>

            {renderUserDrawer()}
        </div>
    );
};

export default AdminDashboard;